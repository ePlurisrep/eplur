#!/usr/bin/env bash
set -euo pipefail

# Helper: open SSH tunnel through an IPv6-capable host and run Prisma commands locally
# Usage: ./scripts/tunnel-prisma.sh -r user@host -p DB_PASSWORD [-e] [-P 15432] [-a action]
#   -r user@host   : remote IPv6-capable host to SSH to
#   -p DB_PASSWORD : database password (will be URL-encoded unless -e is passed)
#   -e             : password is already URL-encoded
#   -P port        : local port to forward to (default 15432)
#   -a action      : prisma action to run: pull (default) or migrate

REMOTE=""
PASS=""
ENCODED=false
LOCAL_PORT=15432
ACTION="pull"

usage() {
  echo "Usage: $0 -r user@host -p DB_PASSWORD [-e] [-P 15432] [-a pull|migrate]"
  exit 1
}

while getopts ":r:p:eP:a:" opt; do
  case $opt in
    r) REMOTE="$OPTARG" ;;
    p) PASS="$OPTARG" ;;
    e) ENCODED=true ;;
    P) LOCAL_PORT="$OPTARG" ;;
    a) ACTION="$OPTARG" ;;
    *) usage ;;
  esac
done

if [ -z "$REMOTE" ] || [ -z "$PASS" ]; then
  usage
fi

if [ "$ENCODED" = true ]; then
  ENCODED_PASS="$PASS"
else
  if command -v python3 >/dev/null 2>&1; then
    ENCODED_PASS=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$PASS")
  else
    echo "python3 required to URL-encode the password (or pass -e with encoded password)" >&2
    exit 1
  fi
fi

DB_HOST="db.fjzcgfeqwdyislfaqbis.supabase.co"

echo "Opening SSH tunnel to ${REMOTE}, forwarding localhost:${LOCAL_PORT} -> ${DB_HOST}:5432"

# start SSH tunnel in background and record pid
ssh -o ExitOnForwardFailure=yes -f -N -L ${LOCAL_PORT}:${DB_HOST}:5432 ${REMOTE}
sleep 0.5

# try to capture the SSH PID for cleanup
TUNNEL_PID=$(pgrep -f "ssh .*${LOCAL_PORT}:${DB_HOST}:5432" | head -n1 || true)
if [ -n "$TUNNEL_PID" ]; then
  echo "Tunnel started (ssh pid=$TUNNEL_PID)"
  echo "$TUNNEL_PID" > /tmp/tunnel-prisma.pid
else
  echo "Warning: couldn't determine ssh tunnel PID. You may need to stop it manually." >&2
fi

export ENCODED_PASS
export DIRECT_URL="postgresql://prisma:${ENCODED_PASS}@localhost:${LOCAL_PORT}/postgres"
export DATABASE_URL="postgresql://prisma:${ENCODED_PASS}@${DB_HOST}:6543/postgres?pgbouncer=true"

echo "Running Prisma action: ${ACTION}"
if [ "$ACTION" = "pull" ]; then
  npx prisma db pull --schema=prisma/schema.prisma
elif [ "$ACTION" = "migrate" ]; then
  npx prisma migrate dev --schema=prisma/schema.prisma
else
  echo "Unknown action: ${ACTION}" >&2
  exit 1
fi

# cleanup tunnel
if [ -n "$TUNNEL_PID" ]; then
  echo "Stopping tunnel pid=$TUNNEL_PID"
  kill "$TUNNEL_PID" || true
  rm -f /tmp/tunnel-prisma.pid || true
fi

echo "Done."
