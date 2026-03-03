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

  Map<String, Object> toJson() {
    return {
      'name': name,
      'splitType': splitType,
      'days': days.map((day) => day.toJson()).toList(),
    };
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

  Map<String, Object> toJson() {
    return {
      'dayName': dayName,
      'exercises': exercises.map((exercise) => exercise.toJson()).toList(),
    };
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

  Map<String, Object> toJson() {
    return {
      'name': name,
      'sets': sets,
      'targetReps': targetReps,
      'targetWeight': targetWeight,
    };
  }
}
