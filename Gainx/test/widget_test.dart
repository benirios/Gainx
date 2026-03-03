import 'package:flutter_test/flutter_test.dart';

import 'package:gainx/main.dart';

void main() {
  testWidgets('shows Clerk key hint when key is missing', (tester) async {
    await tester.pumpWidget(const GainxRoot());
    expect(
      find.textContaining('Missing CLERK_PUBLISHABLE_KEY'),
      findsOneWidget,
    );
  });
}
