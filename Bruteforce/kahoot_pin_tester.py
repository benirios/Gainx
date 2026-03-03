#!/usr/bin/env python3
"""
Safe local tester that attempts 6-digit PINs against a local mock server.
Uses ThreadPoolExecutor and urllib.request (no external deps).
"""
import argparse
import concurrent.futures
import json
import time
import urllib.request
import urllib.error
import threading


def try_pin(pin_int, url, timeout):
    pin = f"{pin_int:06d}"
    data = json.dumps({"pin": pin}).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            if resp.status == 200:
                body = resp.read().decode()
                return True, json.loads(body)
    except urllib.error.HTTPError:
        return False, None
    except Exception:
        return False, None
    return False, None


def find_pin(start, end, url, timeout, workers, found_event, result):
    max_in_flight = max(100, workers * 5)
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as ex:
        future_to_pin = {}
        pin = start
        while pin < end or future_to_pin:
            while pin < end and len(future_to_pin) < max_in_flight and not found_event.is_set():
                f = ex.submit(try_pin, pin, url, timeout)
                future_to_pin[f] = pin
                pin += 1
            if not future_to_pin:
                break
            done, _ = concurrent.futures.wait(future_to_pin.keys(), return_when=concurrent.futures.FIRST_COMPLETED, timeout=1)
            for f in list(done):
                p = future_to_pin.pop(f)
                ok, body = f.result()
                if ok:
                    result['pin'] = f"{p:06d}"
                    result['body'] = body
                    found_event.set()
                    return


def main():
    parser = argparse.ArgumentParser(description="Safe local Kahoot PIN tester against a mock server")
    parser.add_argument("--start", type=int, default=0, help="Start PIN (inclusive, integer)")
    parser.add_argument("--end", type=int, default=10000, help="End PIN (exclusive, integer). Default is 10k for demo")
    parser.add_argument("--workers", type=int, default=100, help="Number of concurrent worker threads")
    parser.add_argument("--url", default="http://127.0.0.1:8000/join", help="Local server join URL")
    parser.add_argument("--timeout", type=float, default=2.0, help="Request timeout seconds")
    args = parser.parse_args()

    found_event = threading.Event()
    result = {}
    total = args.end - args.start
    print(f"Testing {total} PINs from {args.start} to {args.end} with {args.workers} workers against {args.url}")
    t0 = time.time()
    find_pin(args.start, args.end, args.url, args.timeout, args.workers, found_event, result)
    dt = time.time() - t0
    if 'pin' in result:
        print(f"FOUND PIN: {result['pin']} (response: {result['body']}) in {dt:.2f}s")
    else:
        print(f"No PIN found in range after {dt:.2f}s")

if __name__ == "__main__":
    main()
