import 'package:clerk_flutter/clerk_flutter.dart';

class AuthService {
  String? currentUserId(ClerkAuthState authState) => authState.client.user?.id;

  bool isSignedIn(ClerkAuthState authState) => currentUserId(authState) != null;

  Future<void> signOut(ClerkAuthState authState) => authState.signOut();
}
