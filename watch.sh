#!/bin/bash
# حارس الخادم: لو توقف، يعيد تشغيله خلال خمس ثوانٍ
cd /root/workspace/daftar || exit 1
while true; do
  if ! curl -s -m 3 -o /dev/null http://127.0.0.1:8899/index.html; then
    echo "[$(date +%H:%M:%S)] restarting server..." >> /tmp/opencode/daftar-watch.log
    setsid nohup python3 serve.py 8899 >> /tmp/opencode/daftar-srv.log 2>&1 </dev/null &
    sleep 3
  fi
  sleep 5
done
