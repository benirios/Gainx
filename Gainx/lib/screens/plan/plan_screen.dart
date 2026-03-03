import 'package:clerk_flutter/clerk_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/training_plan.dart';
import '../../providers/plan_provider.dart';
import '../../services/auth_service.dart';
import '../workout/workout_placeholder_screen.dart';

class PlanScreen extends ConsumerStatefulWidget {
  const PlanScreen({super.key, required this.userId, required this.authState});

  final String userId;
  final ClerkAuthState authState;

  @override
  ConsumerState<PlanScreen> createState() => _PlanScreenState();
}

class _PlanScreenState extends ConsumerState<PlanScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(planProvider.notifier).loadLatestPlan(userId: widget.userId);
    });
  }

  Future<void> _generatePlan() async {
    final profile = await ref.read(firestoreServiceProvider).getProfile(widget.userId);
    if (!mounted) {
      return;
    }
    if (profile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Complete profile setup before generating plan.')),
      );
      return;
    }

    await ref.read(planProvider.notifier).generatePlan(
      userId: widget.userId,
      experience: profile.experience,
      goal: profile.goal,
      equipment: profile.equipment,
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(planProvider);
    final plan = state.plan;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Your Plan'),
        actions: [
          IconButton(
            onPressed: () => AuthService().signOut(widget.authState),
            icon: const Icon(Icons.logout),
            tooltip: 'Sign out',
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              ElevatedButton(
                onPressed: state.isLoading ? null : _generatePlan,
                child: Text(state.isLoading ? 'Generating...' : 'Generate Plan'),
              ),
              if (state.errorMessage != null) ...[
                const SizedBox(height: 12),
                Text(
                  state.errorMessage!,
                  style: TextStyle(color: Theme.of(context).colorScheme.error),
                ),
              ],
              const SizedBox(height: 16),
              Expanded(
                child: plan == null
                    ? const Center(child: Text('No plan yet. Tap "Generate Plan".'))
                    : _WeeklyPlanView(plan: plan, planId: state.latestPlanId),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _WeeklyPlanView extends StatelessWidget {
  const _WeeklyPlanView({required this.plan, required this.planId});

  final TrainingPlan plan;
  final String? planId;

  @override
  Widget build(BuildContext context) {
    final weekDays = List<TrainingDay>.generate(
      7,
      (index) => index < plan.days.length
          ? plan.days[index]
          : TrainingDay(dayName: 'Day ${index + 1}', exercises: const []),
    );

    return DefaultTabController(
      length: weekDays.length,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(plan.name, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 4),
          Text(plan.splitType, style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 12),
          TabBar(
            isScrollable: true,
            tabs: List.generate(
              weekDays.length,
              (index) => Tab(text: 'Day ${index + 1}'),
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: TabBarView(
              children: weekDays
                  .map(
                    (day) => _PlanDayView(
                      day: day,
                      planId: planId,
                    ),
                  )
                  .toList(),
            ),
          ),
        ],
      ),
    );
  }
}

class _PlanDayView extends StatelessWidget {
  const _PlanDayView({required this.day, required this.planId});

  final TrainingDay day;
  final String? planId;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(day.dayName, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        Expanded(
          child: day.exercises.isEmpty
              ? const Center(child: Text('Rest day'))
              : ListView.separated(
                  itemCount: day.exercises.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final exercise = day.exercises[index];
                    return ListTile(
                      title: Text(exercise.name),
                      subtitle: Text(
                        '${exercise.sets} sets x ${exercise.targetReps} reps x ${exercise.targetWeight}',
                      ),
                      tileColor: Theme.of(context).colorScheme.surfaceContainerHighest,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    );
                  },
                ),
        ),
        const SizedBox(height: 8),
        ElevatedButton(
          onPressed: () {
            Navigator.of(context).push(
              MaterialPageRoute<void>(
                builder: (_) => WorkoutPlaceholderScreen(
                  dayName: day.dayName,
                  planId: planId,
                ),
              ),
            );
          },
          child: const Text('Start Workout'),
        ),
      ],
    );
  }
}
