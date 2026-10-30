#!/usr/bin/env python3
"""حارس دائم لموقع دفتر: يعيد تشغيل serve.py تلقائياً إذا توقف.

الاستخدام:  python3 watchd.py          تشغيل الحارس في الخلفية
            python3 watchd.py stop     إيقاف الحارس
            python3 watchd.py status   عرض الحالة
"""
import os
import subprocess
import sys
import time
import urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = 8899
SRV = os.path.join(ROOT, "serve.py")
LOG = "/tmp/opencode/daftar-srv.log"
PIDF = "/tmp/opencode/daftar-watchd.pid"
DEVNULL = os.open(os.devnull, os.O_RDWR)


def alive(timeout=4):
    try:
        with urllib.request.urlopen("http://127.0.0.1:%d/index.html" % PORT, timeout=timeout) as r:
            return r.status == 200
    except Exception:
        return False


def start_server():
    try:
        with open(LOG, "ab") as f:
            subprocess.Popen([sys.executable, SRV, str(PORT)], cwd=ROOT,
                             stdout=f, stderr=f, stdin=DEVNULL, start_new_session=True)
    except Exception:
        pass


def supervise():
    while True:
        if not alive():
            start_server()
            for _ in range(15):
                time.sleep(2)
                if alive():
                    break
        time.sleep(5)


def daemonize():
    if os.fork() > 0:
        os._exit(0)
    os.setsid()
    if os.fork() > 0:
        os._exit(0)
    os.chdir("/")
    os.dup2(DEVNULL, 0)
    os.dup2(DEVNULL, 1)
    os.dup2(DEVNULL, 2)
    with open(PIDF, "w") as f:
        f.write(str(os.getpid()))


def read_pid():
    try:
        with open(PIDF) as f:
            return int(f.read().strip())
    except Exception:
        return None


def stop():
    pid = read_pid()
    if pid:
        try:
            os.kill(pid, 15)
            print("أُوقف الحارس %d" % pid)
        except Exception:
            pass
    else:
        print("ما فيه حارس شغّال")
    try:
        os.remove(PIDF)
    except Exception:
        pass


def status():
    pid = read_pid()
    ok = pid is not None and os.path.exists("/proc/%d" % pid)
    print("الحارس: %s" % ("شغّال PID=%d" % pid if ok else "متوقف"))
    print("السيرفر: %s" % ("200" if alive() else "مطفي"))


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "start"
    if cmd == "stop":
        stop()
    elif cmd == "status":
        status()
    else:
        daemonize()
        supervise()
