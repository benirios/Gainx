import 'package:clerk_flutter/clerk_flutter.dart';
import 'package:flutter/material.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            children: [
              SizedBox(height: 24),
              Text(
                'Welcome to Gainx',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 12),
              Text(
                'Sign in with Email, Google, or Apple',
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 24),
              Expanded(child: ClerkAuthentication()),
            ],
          ),
        ),
      ),
    );
  }
}
