import 'package:cloud_firestore/cloud_firestore.dart';

class FirestoreService {
  final FirebaseFirestore _firestore;

  FirestoreService({FirebaseFirestore? firestore})
    : _firestore = firestore ?? FirebaseFirestore.instance;

  Future<bool> hasProfile(String userId) async {
    final doc = await _firestore.collection('users').doc(userId).get();
    return doc.exists;
  }

  Future<void> saveProfile({
    required String userId,
    required String experience,
    required String goal,
    required String equipment,
  }) {
    return _firestore.collection('users').doc(userId).set({
      'createdAt': FieldValue.serverTimestamp(),
      'profile': {
        'experience': experience,
        'goal': goal,
        'equipment': equipment,
      },
    }, SetOptions(merge: true));
  }
}
