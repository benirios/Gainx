import 'training_plan.dart';

class WorkoutSetDraft {
  const WorkoutSetDraft({this.reps, this.weight, this.effort = 7});

  final int? reps;
  final double? weight;
  final int effort;

  WorkoutSetDraft copyWith({int? reps, double? weight, int? effort}) {
    return WorkoutSetDraft(
      reps: reps ?? this.reps,
      weight: weight ?? this.weight,
      effort: effort ?? this.effort,
    );
  }

  Map<String, Object?> toJson() {
    return {
      'reps': reps,
      'weight': weight,
      'effort': effort,
    };
  }

  factory WorkoutSetDraft.fromJson(Map<String, dynamic> json) {
    final reps = json['reps'];
    final weight = json['weight'];
    final effort = json['effort'];
    return WorkoutSetDraft(
      reps: reps is int ? reps : null,
      weight: weight is num ? weight.toDouble() : null,
      effort: effort is int ? effort : 7,
    );
  }
}

class WorkoutExerciseDraft {
  const WorkoutExerciseDraft({required this.name, required this.sets});

  final String name;
  final List<WorkoutSetDraft> sets;

  WorkoutExerciseDraft copyWith({String? name, List<WorkoutSetDraft>? sets}) {
    return WorkoutExerciseDraft(name: name ?? this.name, sets: sets ?? this.sets);
  }

  Map<String, Object?> toJson() {
    return {
      'name': name,
      'sets': sets.map((set) => set.toJson()).toList(),
    };
  }

  factory WorkoutExerciseDraft.fromJson(Map<String, dynamic> json) {
    final name = json['name'];
    final setJson = json['sets'];
    if (name is! String || setJson is! List) {
      throw const FormatException('Invalid workout exercise draft payload');
    }
    return WorkoutExerciseDraft(
      name: name,
      sets: setJson
          .map((set) => WorkoutSetDraft.fromJson(Map<String, dynamic>.from(set as Map)))
          .toList(),
    );
  }
}

class WorkoutSetLog {
  const WorkoutSetLog({
    required this.reps,
    required this.weight,
    required this.effort,
  });

  final int reps;
  final double weight;
  final int effort;

  Map<String, Object> toJson() {
    return {
      'reps': reps,
      'weight': weight,
      'effort': effort,
    };
  }
}

class WorkoutExerciseLog {
  const WorkoutExerciseLog({required this.name, required this.sets});

  final String name;
  final List<WorkoutSetLog> sets;

  Map<String, Object> toJson() {
    return {
      'name': name,
      'sets': sets.map((set) => set.toJson()).toList(),
    };
  }
}

class WorkoutLog {
  const WorkoutLog({
    required this.planId,
    required this.dayIndex,
    required this.dayName,
    required this.date,
    required this.exercises,
  });

  final String planId;
  final int dayIndex;
  final String dayName;
  final DateTime date;
  final List<WorkoutExerciseLog> exercises;

  Map<String, Object> toCompletedJson() {
    return {
      'planId': planId,
      'dayIndex': dayIndex,
      'dayName': dayName,
      'date': date,
      'inProgress': false,
      'exercises': exercises.map((exercise) => exercise.toJson()).toList(),
    };
  }
}

class WorkoutDraft {
  const WorkoutDraft({
    this.logId,
    required this.planId,
    required this.dayIndex,
    required this.dayName,
    required this.date,
    required this.exercises,
  });

  final String? logId;
  final String planId;
  final int dayIndex;
  final String dayName;
  final DateTime date;
  final List<WorkoutExerciseDraft> exercises;

  WorkoutDraft copyWith({
    String? logId,
    String? planId,
    int? dayIndex,
    String? dayName,
    DateTime? date,
    List<WorkoutExerciseDraft>? exercises,
  }) {
    return WorkoutDraft(
      logId: logId ?? this.logId,
      planId: planId ?? this.planId,
      dayIndex: dayIndex ?? this.dayIndex,
      dayName: dayName ?? this.dayName,
      date: date ?? this.date,
      exercises: exercises ?? this.exercises,
    );
  }

  Map<String, Object?> toDraftJson() {
    return {
      'planId': planId,
      'dayIndex': dayIndex,
      'dayName': dayName,
      'date': date,
      'inProgress': true,
      'exercises': exercises.map((exercise) => exercise.toJson()).toList(),
    };
  }

  static WorkoutDraft fromTrainingDay({
    required String planId,
    required int dayIndex,
    required TrainingDay day,
  }) {
    return WorkoutDraft(
      planId: planId,
      dayIndex: dayIndex,
      dayName: day.dayName,
      date: DateTime.now(),
      exercises: day.exercises
          .map(
            (exercise) => WorkoutExerciseDraft(
              name: exercise.name,
              sets: List<WorkoutSetDraft>.generate(
                exercise.sets,
                (_) => const WorkoutSetDraft(),
              ),
            ),
          )
          .toList(),
    );
  }

  WorkoutLog toWorkoutLog() {
    return WorkoutLog(
      planId: planId,
      dayIndex: dayIndex,
      dayName: dayName,
      date: date,
      exercises: exercises
          .map(
            (exercise) => WorkoutExerciseLog(
              name: exercise.name,
              sets: exercise.sets
                  .map(
                    (set) {
                      if (set.reps == null || set.weight == null) {
                        throw const FormatException('Cannot complete workout with empty sets');
                      }
                      return WorkoutSetLog(
                        reps: set.reps!,
                        weight: set.weight!,
                        effort: set.effort,
                      );
                    },
                  )
                  .toList(),
            ),
          )
          .toList(),
    );
  }
}
