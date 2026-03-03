import 'package:clerk_flutter/clerk_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app.dart';

void main() {
  runApp(const ProviderScope(child: GainxRoot()));
}

class GainxRoot extends StatelessWidget {
  const GainxRoot({super.key});

  static const _publishableKey = String.fromEnvironment(
    'CLERK_PUBLISHABLE_KEY',
  );

  @override
  Widget build(BuildContext context) {
    if (_publishableKey.isEmpty) {
      return const MaterialApp(
        home: Scaffold(
          body: Center(
            child: Padding(
              padding: EdgeInsets.all(24),
              child: Text(
                'Missing CLERK_PUBLISHABLE_KEY.\n'
                'Run with --dart-define=CLERK_PUBLISHABLE_KEY=pk_...',
                textAlign: TextAlign.center,
              ),
            ),
          ),
        ),
      );
    }

    return ClerkAuth(
      config: ClerkAuthConfig(publishableKey: _publishableKey),
      child: const GainxApp(),
    );
  }
}
