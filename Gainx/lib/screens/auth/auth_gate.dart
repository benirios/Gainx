import 'package:clerk_flutter/clerk_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../providers/auth_provider.dart';
import '../../services/firestore_service.dart';
import '../plan/plan_screen.dart';
import '../profile/profile_setup_screen.dart';
import 'login_screen.dart';
import 'signup_screen.dart';

class AuthGate extends ConsumerWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ClerkErrorListener(
      child: ClerkAuthBuilder(
        signedOutBuilder: (context, authState) {
          return const LoginScreen();
        },
        signedInBuilder: (context, authState) {
          final authStatus = ref.watch(authStatusProvider(authState));
          if (authStatus == AuthStatus.signedOut) {
            return const SignupScreen();
          }

          final userId = ref.read(authServiceProvider).currentUserId(authState);
          if (userId == null) {
            return const SignupScreen();
          }

          return _SignedInRouter(userId: userId, authState: authState);
        },
      ),
    );
  }
}

class _SignedInRouter extends StatefulWidget {
  const _SignedInRouter({required this.userId, required this.authState});

  final String userId;
  final ClerkAuthState authState;

  @override
  State<_SignedInRouter> createState() => _SignedInRouterState();
}

class _SignedInRouterState extends State<_SignedInRouter> {
  final _firestoreService = FirestoreService();
  late final Future<bool> _hasProfileFuture;

  @override
  void initState() {
    super.initState();
    _hasProfileFuture = _firestoreService.hasProfile(widget.userId);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<bool>(
      future: _hasProfileFuture,
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        if (snapshot.data == false) {
          return ProfileSetupScreen(userId: widget.userId);
        }
        return PlanScreen(userId: widget.userId, authState: widget.authState);
      },
    );
  }
}
