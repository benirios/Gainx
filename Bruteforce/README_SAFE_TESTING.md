This repository addition provides a safe local mock server and a PIN tester for educational/testing purposes.

Files:
- mock_kahoot_server.py : Simple local HTTP server that accepts POST /join with JSON {"pin":"123456"}. A small set of VALID_PINS is defined inside the file.
- kahoot_pin_tester.py : Threaded tester that attempts 6-digit PINs against a configurable local URL using only the Python standard library.

Quick start:
1) Run the mock server in one terminal:
   python3 mock_kahoot_server.py

2) In another terminal, run the tester (default tests 0..9999):
   python3 kahoot_pin_tester.py --start 0 --end 10000 --workers 200

Notes:
- This is for local, ethical testing only. Do NOT run against Kahoot's real services or other people's games without explicit permission.
- The tester defaults to a small range for demo; adjust --end for larger experiments, but be mindful of resource usage.
