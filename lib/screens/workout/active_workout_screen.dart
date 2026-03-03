import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/training_plan.dart';
import '../../models/workout_log.dart';
import '../../providers/workout_provider.dart';

class ActiveWorkoutScreen extends ConsumerStatefulWidget {
  const ActiveWorkoutScreen({
    super.key,
    required this.userId,
    required this.planId,
    required this.dayIndex,
    required this.day,
  });

  final String userId;
  final String planId;
  final int dayIndex;
  final TrainingDay day;

  @override
  ConsumerState<ActiveWorkoutScreen> createState() => _ActiveWorkoutScreenState();
}

class _ActiveWorkoutScreenState extends ConsumerState<ActiveWorkoutScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(workoutProvider.notifier).startWorkout(
        userId: widget.userId,
        planId: widget.planId,
        dayIndex: widget.dayIndex,
        day: widget.day,
      );
    });
  }

  Future<void> _completeWorkout() async {
    final completed = await ref.read(workoutProvider.notifier).completeWorkout();
    if (!mounted) {
      return;
    }
    if (completed) {
      Navigator.of(context).pop(true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(workoutProvider);
    final draft = state.draft;

    return Scaffold(
      appBar: AppBar(title: Text(widget.day.dayName)),
      body: SafeArea(
        child: state.isLoading || draft == null
            ? const Center(child: CircularProgressIndicator())
            : Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    if (state.saveErrorMessage != null)
                      Text(
                        state.saveErrorMessage!,
                        style: TextStyle(color: Theme.of(context).colorScheme.error),
                      )
                    else if (state.isSaving)
                      const Text('Saving...')
                    else if (state.lastSavedAt != null)
                      Text('Saved ${_formatTime(state.lastSavedAt!)}'),
                    const SizedBox(height: 12),
                    Expanded(
                      child: ListView.separated(
                        itemCount: draft.exercises.length,
                        separatorBuilder: (_, _) => const SizedBox(height: 12),
                        itemBuilder: (context, exerciseIndex) {
                          final exercise = draft.exercises[exerciseIndex];
                          return _ExerciseCard(
                            exercise: exercise,
                            exerciseIndex: exerciseIndex,
                          );
                        },
                      ),
                    ),
                    if (state.errorMessage != null)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Text(
                          state.errorMessage!,
                          style: TextStyle(color: Theme.of(context).colorScheme.error),
                        ),
                      ),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: state.isCompleting ? null : _completeWorkout,
                        child: Text(
                          state.isCompleting ? 'Completing...' : 'Complete Workout',
                        ),
                      ),
                    ),
                  ],
                ),
              ),
      ),
    );
  }

  String _formatTime(DateTime savedAt) {
    final hh = savedAt.hour.toString().padLeft(2, '0');
    final mm = savedAt.minute.toString().padLeft(2, '0');
    final ss = savedAt.second.toString().padLeft(2, '0');
    return '$hh:$mm:$ss';
  }
}

class _ExerciseCard extends ConsumerWidget {
  const _ExerciseCard({
    required this.exercise,
    required this.exerciseIndex,
  });

  final WorkoutExerciseDraft exercise;
  final int exerciseIndex;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(exercise.name, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            ...List.generate(exercise.sets.length, (setIndex) {
              final set = exercise.sets[setIndex];
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            initialValue: set.reps?.toString() ?? '',
                            keyboardType: TextInputType.number,
                            decoration: InputDecoration(
                              labelText: 'Reps ${setIndex + 1}',
                            ),
                            onChanged: (value) {
                              ref.read(workoutProvider.notifier).updateReps(
                                exerciseIndex: exerciseIndex,
                                setIndex: setIndex,
                                value: value,
                              );
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextFormField(
                            initialValue: set.weight?.toString() ?? '',
                            keyboardType: const TextInputType.numberWithOptions(
                              decimal: true,
                            ),
                            decoration: InputDecoration(
                              labelText: 'Weight ${setIndex + 1}',
                            ),
                            onChanged: (value) {
                              ref.read(workoutProvider.notifier).updateWeight(
                                exerciseIndex: exerciseIndex,
                                setIndex: setIndex,
                                value: value,
                              );
                            },
                          ),
                        ),
                        IconButton(
                          onPressed: () {
                            ref.read(workoutProvider.notifier).removeSet(
                              exerciseIndex: exerciseIndex,
                              setIndex: setIndex,
                            );
                          },
                          icon: const Icon(Icons.remove_circle_outline),
                          tooltip: 'Remove set',
                        ),
                      ],
                    ),
                    Slider(
                      value: set.effort.toDouble(),
                      min: 1,
                      max: 10,
                      divisions: 9,
                      label: 'Effort ${set.effort}',
                      onChanged: (value) {
                        ref.read(workoutProvider.notifier).updateEffort(
                          exerciseIndex: exerciseIndex,
                          setIndex: setIndex,
                          effort: value.round(),
                        );
                      },
                    ),
                  ],
                ),
              );
            }),
            TextButton.icon(
              onPressed: () => ref.read(workoutProvider.notifier).addSet(exerciseIndex),
              icon: const Icon(Icons.add),
              label: const Text('Add set'),
            ),
          ],
        ),
      ),
    );
  }
}
