import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/training_plan.dart';
import '../models/workout_log.dart';
import '../services/firestore_service.dart';

final workoutFirestoreServiceProvider =
    Provider<FirestoreService>((ref) => FirestoreService());

final workoutProvider = NotifierProvider<WorkoutNotifier, WorkoutState>(
  WorkoutNotifier.new,
);

class WorkoutNotifier extends Notifier<WorkoutState> {
  int _saveSequence = 0;

  @override
  WorkoutState build() => const WorkoutState();

  Future<void> startWorkout({
    required String userId,
    required String planId,
    required int dayIndex,
    required TrainingDay day,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final existing = await ref
          .read(workoutFirestoreServiceProvider)
          .getInProgressWorkout(
            userId: userId,
            planId: planId,
            dayIndex: dayIndex,
          );

      final draft =
          existing?.draft ??
          WorkoutDraft.fromTrainingDay(planId: planId, dayIndex: dayIndex, day: day);
      state = state.copyWith(
        isLoading: false,
        userId: userId,
        draft: draft,
        logId: existing?.logId,
      );
      await _autosave();
    } on FormatException catch (error) {
      state = state.copyWith(isLoading: false, errorMessage: error.message);
    }
  }

  void updateReps({
    required int exerciseIndex,
    required int setIndex,
    required String value,
  }) {
    final draft = state.draft;
    if (draft == null) return;
    final reps = value.trim().isEmpty ? null : int.tryParse(value.trim());
    final nextExercises = _copyExercises(draft.exercises);
    final current = nextExercises[exerciseIndex].sets[setIndex];
    nextExercises[exerciseIndex].sets[setIndex] = current.copyWith(reps: reps);
    _updateDraft(draft.copyWith(exercises: nextExercises));
  }

  void updateWeight({
    required int exerciseIndex,
    required int setIndex,
    required String value,
  }) {
    final draft = state.draft;
    if (draft == null) return;
    final weight = value.trim().isEmpty ? null : double.tryParse(value.trim());
    final nextExercises = _copyExercises(draft.exercises);
    final current = nextExercises[exerciseIndex].sets[setIndex];
    nextExercises[exerciseIndex].sets[setIndex] = current.copyWith(weight: weight);
    _updateDraft(draft.copyWith(exercises: nextExercises));
  }

  void updateEffort({
    required int exerciseIndex,
    required int setIndex,
    required int effort,
  }) {
    final draft = state.draft;
    if (draft == null) return;
    final nextExercises = _copyExercises(draft.exercises);
    final current = nextExercises[exerciseIndex].sets[setIndex];
    nextExercises[exerciseIndex].sets[setIndex] = current.copyWith(effort: effort);
    _updateDraft(draft.copyWith(exercises: nextExercises));
  }

  void addSet(int exerciseIndex) {
    final draft = state.draft;
    if (draft == null) return;
    final nextExercises = _copyExercises(draft.exercises);
    final sets = List<WorkoutSetDraft>.from(nextExercises[exerciseIndex].sets)
      ..add(const WorkoutSetDraft());
    nextExercises[exerciseIndex] = nextExercises[exerciseIndex].copyWith(sets: sets);
    _updateDraft(draft.copyWith(exercises: nextExercises));
  }

  void removeSet({
    required int exerciseIndex,
    required int setIndex,
  }) {
    final draft = state.draft;
    if (draft == null) return;
    final nextExercises = _copyExercises(draft.exercises);
    final sets = List<WorkoutSetDraft>.from(nextExercises[exerciseIndex].sets);
    if (setIndex < 0 || setIndex >= sets.length) return;
    sets.removeAt(setIndex);
    if (sets.isEmpty) {
      sets.add(const WorkoutSetDraft());
    }
    nextExercises[exerciseIndex] = nextExercises[exerciseIndex].copyWith(sets: sets);
    _updateDraft(draft.copyWith(exercises: nextExercises));
  }

  Future<bool> completeWorkout() async {
    final currentState = state;
    final draft = currentState.draft;
    if (draft == null || currentState.userId == null) {
      return false;
    }
    if (!currentState.canComplete) {
      state = state.copyWith(errorMessage: 'Fill in all reps and weight values first.');
      return false;
    }

    final logId = currentState.logId;
    if (logId == null) {
      state = state.copyWith(errorMessage: 'Workout draft is not saved yet.');
      return false;
    }

    state = state.copyWith(isCompleting: true, errorMessage: null);
    await ref.read(workoutFirestoreServiceProvider).completeWorkout(
      userId: currentState.userId!,
      logId: logId,
      workout: draft.toWorkoutLog(),
    );
    state = state.copyWith(isCompleting: false, completed: true);
    return true;
  }

  void _updateDraft(WorkoutDraft draft) {
    state = state.copyWith(draft: draft, errorMessage: null);
    unawaited(_autosave());
  }

  Future<void> _autosave() async {
    final currentState = state;
    final draft = currentState.draft;
    final userId = currentState.userId;
    if (draft == null || userId == null) {
      return;
    }

    final sequence = ++_saveSequence;
    state = state.copyWith(isSaving: true, saveErrorMessage: null);
    try {
      final logId = await ref.read(workoutFirestoreServiceProvider).saveWorkoutDraft(
        userId: userId,
        draft: draft.copyWith(logId: currentState.logId),
      );
      if (sequence == _saveSequence) {
        state = state.copyWith(
          isSaving: false,
          logId: logId,
          lastSavedAt: DateTime.now(),
          saveErrorMessage: null,
        );
      }
    } catch (_) {
      if (sequence == _saveSequence) {
        state = state.copyWith(
          isSaving: false,
          saveErrorMessage: 'Autosave failed. Check connection.',
        );
      }
    }
  }

  List<WorkoutExerciseDraft> _copyExercises(List<WorkoutExerciseDraft> source) {
    return source
        .map(
          (exercise) => exercise.copyWith(
            sets: List<WorkoutSetDraft>.from(exercise.sets),
          ),
        )
        .toList();
  }
}

class WorkoutState {
  const WorkoutState({
    this.userId,
    this.logId,
    this.draft,
    this.isLoading = false,
    this.isSaving = false,
    this.isCompleting = false,
    this.completed = false,
    this.lastSavedAt,
    this.errorMessage,
    this.saveErrorMessage,
  });

  final String? userId;
  final String? logId;
  final WorkoutDraft? draft;
  final bool isLoading;
  final bool isSaving;
  final bool isCompleting;
  final bool completed;
  final DateTime? lastSavedAt;
  final String? errorMessage;
  final String? saveErrorMessage;

  bool get canComplete {
    final draft = this.draft;
    if (draft == null || draft.exercises.isEmpty) {
      return false;
    }
    for (final exercise in draft.exercises) {
      if (exercise.sets.isEmpty) {
        return false;
      }
      for (final set in exercise.sets) {
        if (set.reps == null || set.reps! <= 0 || set.weight == null || set.weight! < 0) {
          return false;
        }
      }
    }
    return true;
  }

  WorkoutState copyWith({
    String? userId,
    String? logId,
    WorkoutDraft? draft,
    bool? isLoading,
    bool? isSaving,
    bool? isCompleting,
    bool? completed,
    DateTime? lastSavedAt,
    String? errorMessage,
    String? saveErrorMessage,
  }) {
    return WorkoutState(
      userId: userId ?? this.userId,
      logId: logId ?? this.logId,
      draft: draft ?? this.draft,
      isLoading: isLoading ?? this.isLoading,
      isSaving: isSaving ?? this.isSaving,
      isCompleting: isCompleting ?? this.isCompleting,
      completed: completed ?? this.completed,
      lastSavedAt: lastSavedAt ?? this.lastSavedAt,
      errorMessage: errorMessage,
      saveErrorMessage: saveErrorMessage,
    );
  }
}
