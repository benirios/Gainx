import 'package:flutter/material.dart';

class WorkoutPlaceholderScreen extends StatelessWidget {
  const WorkoutPlaceholderScreen({
    super.key,
    required this.dayName,
    required this.planId,
  });

  final String dayName;
  final String? planId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Workout')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Text(
            'Workout logging for $dayName (plan: ${planId ?? 'latest'}) is coming in Day 5.',
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}
