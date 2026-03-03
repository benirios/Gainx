import 'package:cloud_functions/cloud_functions.dart';

class AiService {
  AiService({FirebaseFunctions? functions})
    : _functions = functions ?? FirebaseFunctions.instance;

  final FirebaseFunctions _functions;

  Future<TrainingPlan> generatePlan({
    required String experience,
    required String goal,
    required String equipment,
  }) async {
    final callable = _functions.httpsCallable('generatePlan');
    try {
      final response = await callable.call(<String, String>{
        'experience': experience,
        'goal': goal,
        'equipment': equipment,
      });
      return TrainingPlan.fromJson(Map<String, dynamic>.from(response.data as Map));
    } on FirebaseFunctionsException catch (error) {
      throw AiServiceException(
        error.message ?? 'Failed to generate plan (${error.code})',
      );
    }
  }
}

class TrainingPlan {
  const TrainingPlan({
    required this.name,
    required this.splitType,
    required this.days,
  });

  final String name;
  final String splitType;
  final List<TrainingDay> days;

  factory TrainingPlan.fromJson(Map<String, dynamic> json) {
    final name = json['name'];
    final splitType = json['splitType'];
    final dayJson = json['days'];
    if (name is! String || splitType is! String || dayJson is! List) {
      throw const FormatException('Invalid training plan payload');
    }
    return TrainingPlan(
      name: name,
      splitType: splitType,
      days: dayJson
          .map(
            (item) => TrainingDay.fromJson(Map<String, dynamic>.from(item as Map)),
          )
          .toList(),
    );
  }
}

class TrainingDay {
  const TrainingDay({required this.dayName, required this.exercises});

  final String dayName;
  final List<TrainingExercise> exercises;

  factory TrainingDay.fromJson(Map<String, dynamic> json) {
    final dayName = json['dayName'];
    final exercisesJson = json['exercises'];
    if (dayName is! String || exercisesJson is! List) {
      throw const FormatException('Invalid training day payload');
    }
    return TrainingDay(
      dayName: dayName,
      exercises: exercisesJson
          .map(
            (item) =>
                TrainingExercise.fromJson(Map<String, dynamic>.from(item as Map)),
          )
          .toList(),
    );
  }
}

class TrainingExercise {
  const TrainingExercise({
    required this.name,
    required this.sets,
    required this.targetReps,
    required this.targetWeight,
  });

  final String name;
  final int sets;
  final String targetReps;
  final String targetWeight;

  factory TrainingExercise.fromJson(Map<String, dynamic> json) {
    final name = json['name'];
    final sets = json['sets'];
    final targetReps = json['targetReps'];
    final targetWeight = json['targetWeight'];
    if (name is! String ||
        sets is! int ||
        targetReps is! String ||
        targetWeight is! String) {
      throw const FormatException('Invalid training exercise payload');
    }
    return TrainingExercise(
      name: name,
      sets: sets,
      targetReps: targetReps,
      targetWeight: targetWeight,
    );
  }
}

class AiServiceException implements Exception {
  const AiServiceException(this.message);

  final String message;

  @override
  String toString() => message;
}
