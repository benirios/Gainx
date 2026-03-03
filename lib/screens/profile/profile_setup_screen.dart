import 'package:flutter/material.dart';

import '../../services/firestore_service.dart';

class ProfileSetupScreen extends StatefulWidget {
  const ProfileSetupScreen({super.key, required this.userId});

  final String userId;

  @override
  State<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends State<ProfileSetupScreen> {
  final _firestoreService = FirestoreService();
  bool _saving = false;

  String _experience = 'beginner';
  String _goal = 'hypertrophy';
  String _equipment = 'gym';

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      await _firestoreService.saveProfile(
        userId: widget.userId,
        experience: _experience,
        goal: _goal,
        equipment: _equipment,
      );
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Profile saved')));
      }
    } finally {
      if (mounted) {
        setState(() => _saving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile setup')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            DropdownButtonFormField<String>(
              initialValue: _experience,
              decoration: const InputDecoration(labelText: 'Experience'),
              items: const [
                DropdownMenuItem(value: 'beginner', child: Text('Beginner')),
                DropdownMenuItem(
                  value: 'intermediate',
                  child: Text('Intermediate'),
                ),
                DropdownMenuItem(value: 'advanced', child: Text('Advanced')),
              ],
              onChanged: (value) => setState(() => _experience = value!),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              initialValue: _goal,
              decoration: const InputDecoration(labelText: 'Goal'),
              items: const [
                DropdownMenuItem(
                  value: 'hypertrophy',
                  child: Text('Hypertrophy'),
                ),
                DropdownMenuItem(value: 'strength', child: Text('Strength')),
                DropdownMenuItem(value: 'fat_loss', child: Text('Fat loss')),
              ],
              onChanged: (value) => setState(() => _goal = value!),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              initialValue: _equipment,
              decoration: const InputDecoration(labelText: 'Equipment'),
              items: const [
                DropdownMenuItem(value: 'gym', child: Text('Gym')),
                DropdownMenuItem(value: 'home', child: Text('Home')),
                DropdownMenuItem(value: 'minimal', child: Text('Minimal')),
              ],
              onChanged: (value) => setState(() => _equipment = value!),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _saving ? null : _save,
                child: Text(_saving ? 'Saving...' : 'Save profile'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
