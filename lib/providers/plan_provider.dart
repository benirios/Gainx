import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/training_plan.dart';
import '../services/ai_service.dart';
import '../services/firestore_service.dart';

final aiServiceProvider = Provider<AiService>((ref) => AiService());
final firestoreServiceProvider =
    Provider<FirestoreService>((ref) => FirestoreService());

final planProvider = NotifierProvider<PlanNotifier, PlanGenerationState>(
  PlanNotifier.new,
);

class PlanNotifier extends Notifier<PlanGenerationState> {
  @override
  PlanGenerationState build() => const PlanGenerationState();

  Future<void> generatePlan({
    required String userId,
    required String experience,
    required String goal,
    required String equipment,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final plan = await ref.read(aiServiceProvider).generatePlan(
        experience: experience,
        goal: goal,
        equipment: equipment,
      );
      final planId = await ref
          .read(firestoreServiceProvider)
          .savePlan(userId: userId, plan: plan);
      state = state.copyWith(isLoading: false, plan: plan, latestPlanId: planId);
    } on AiServiceException catch (error) {
      state = state.copyWith(
        isLoading: false,
        plan: null,
        clearLatestPlanId: true,
        errorMessage: error.message,
      );
    } on FormatException catch (error) {
      state = state.copyWith(
        isLoading: false,
        plan: null,
        clearLatestPlanId: true,
        errorMessage: error.message,
      );
    }
  }

  Future<void> loadLatestPlan({required String userId}) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final latest = await ref.read(firestoreServiceProvider).getLatestPlan(userId);
      state = state.copyWith(
        isLoading: false,
        plan: latest?.plan,
        latestPlanId: latest?.planId,
      );
    } on FormatException catch (error) {
      state = state.copyWith(
        isLoading: false,
        plan: null,
        clearLatestPlanId: true,
        errorMessage: error.message,
      );
    }
  }
}

class PlanGenerationState {
  const PlanGenerationState({
    this.isLoading = false,
    this.plan,
    this.latestPlanId,
    this.errorMessage,
  });

  final bool isLoading;
  final TrainingPlan? plan;
  final String? latestPlanId;
  final String? errorMessage;

  PlanGenerationState copyWith({
    bool? isLoading,
    TrainingPlan? plan,
    String? latestPlanId,
    bool clearPlan = false,
    bool clearLatestPlanId = false,
    String? errorMessage,
  }) {
    return PlanGenerationState(
      isLoading: isLoading ?? this.isLoading,
      plan: clearPlan ? null : (plan ?? this.plan),
      latestPlanId: clearLatestPlanId ? null : (latestPlanId ?? this.latestPlanId),
      errorMessage: errorMessage,
    );
  }
}
