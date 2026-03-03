import 'package:flutter/material.dart';

import 'screens/auth/auth_gate.dart';

class GainxApp extends StatelessWidget {
  const GainxApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Gainx',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
      ),
      home: const AuthGate(),
    );
  }
}
