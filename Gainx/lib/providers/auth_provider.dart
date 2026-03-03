import 'package:clerk_flutter/clerk_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/auth_service.dart';

final authServiceProvider = Provider<AuthService>((ref) => AuthService());

final authStatusProvider = Provider.family<AuthStatus, ClerkAuthState>((
  ref,
  authState,
) {
  final authService = ref.watch(authServiceProvider);
  return authService.isSignedIn(authState)
      ? AuthStatus.signedIn
      : AuthStatus.signedOut;
});

enum AuthStatus { signedIn, signedOut }
