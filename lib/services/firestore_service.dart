import 'package:cloud_firestore/cloud_firestore.dart';

import '../models/training_plan.dart';
import '../models/workout_log.dart';

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

  Future<UserProfileData?> getProfile(String userId) async {
    final doc = await _firestore.collection('users').doc(userId).get();
    if (!doc.exists) {
      return null;
    }

    final profile = doc.data()?['profile'];
    if (profile is! Map) {
      return null;
    }

    final data = Map<String, dynamic>.from(profile);
    final experience = data['experience'];
    final goal = data['goal'];
    final equipment = data['equipment'];
    if (experience is! String || goal is! String || equipment is! String) {
      return null;
    }

    return UserProfileData(
      experience: experience,
      goal: goal,
      equipment: equipment,
    );
  }

  Future<String> savePlan({
    required String userId,
    required TrainingPlan plan,
  }) async {
    final doc = _firestore.collection('users').doc(userId).collection('plans').doc();
    await doc.set({
      ...plan.toJson(),
      'createdAt': FieldValue.serverTimestamp(),
    });
    return doc.id;
  }

  Future<SavedTrainingPlan?> getLatestPlan(String userId) async {
    final snapshot = await _firestore
        .collection('users')
        .doc(userId)
        .collection('plans')
        .orderBy('createdAt', descending: true)
        .limit(1)
        .get();

    if (snapshot.docs.isEmpty) {
      return null;
    }

    final doc = snapshot.docs.first;
    final data = doc.data();
    final parsed = TrainingPlan.fromJson({
      'name': data['name'],
      'splitType': data['splitType'],
      'days': data['days'],
    });
    return SavedTrainingPlan(planId: doc.id, plan: parsed);
  }

  Future<SavedWorkoutDraft?> getInProgressWorkout({
    required String userId,
    required String planId,
    required int dayIndex,
  }) async {
    final snapshot = await _firestore
        .collection('users')
        .doc(userId)
        .collection('workoutLogs')
        .where('planId', isEqualTo: planId)
        .where('dayIndex', isEqualTo: dayIndex)
        .where('inProgress', isEqualTo: true)
        .limit(1)
        .get();

    if (snapshot.docs.isEmpty) {
      return null;
    }

    final doc = snapshot.docs.first;
    final data = doc.data();
    final exercises = data['exercises'];
    final dayName = data['dayName'];
    final date = data['date'];
    if (exercises is! List || dayName is! String) {
      throw const FormatException('Invalid in-progress workout payload');
    }

    return SavedWorkoutDraft(
      logId: doc.id,
      draft: WorkoutDraft(
        logId: doc.id,
        planId: planId,
        dayIndex: dayIndex,
        dayName: dayName,
        date: date is Timestamp ? date.toDate() : DateTime.now(),
        exercises: exercises
            .map(
              (exercise) => WorkoutExerciseDraft.fromJson(
                Map<String, dynamic>.from(exercise as Map),
              ),
            )
            .toList(),
      ),
    );
  }

  Future<String> saveWorkoutDraft({
    required String userId,
    required WorkoutDraft draft,
  }) async {
    final doc =
        draft.logId == null
            ? _firestore.collection('users').doc(userId).collection('workoutLogs').doc()
            : _firestore
                .collection('users')
                .doc(userId)
                .collection('workoutLogs')
                .doc(draft.logId);

    await doc.set({
      ...draft.toDraftJson(),
      'date': Timestamp.fromDate(draft.date),
      'updatedAt': FieldValue.serverTimestamp(),
      'completedAt': null,
    }, SetOptions(merge: true));
    return doc.id;
  }

  Future<void> completeWorkout({
    required String userId,
    required String logId,
    required WorkoutLog workout,
  }) {
    return _firestore
        .collection('users')
        .doc(userId)
        .collection('workoutLogs')
        .doc(logId)
        .set({
          ...workout.toCompletedJson(),
          'date': Timestamp.fromDate(workout.date),
          'updatedAt': FieldValue.serverTimestamp(),
          'completedAt': FieldValue.serverTimestamp(),
        }, SetOptions(merge: true));
  }
}

class UserProfileData {
  const UserProfileData({
    required this.experience,
    required this.goal,
    required this.equipment,
  });

  final String experience;
  final String goal;
  final String equipment;
}

class SavedTrainingPlan {
  const SavedTrainingPlan({required this.planId, required this.plan});

  final String planId;
  final TrainingPlan plan;
}

class SavedWorkoutDraft {
  const SavedWorkoutDraft({required this.logId, required this.draft});

  final String logId;
  final WorkoutDraft draft;
}
