import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/ai_service.dart';

final aiServiceProvider = Provider<AiService>((ref) => AiService());

final planProvider = NotifierProvider<PlanNotifier, PlanGenerationState>(
  PlanNotifier.new,
);

class PlanNotifier extends Notifier<PlanGenerationState> {
  @override
  PlanGenerationState build() => const PlanGenerationState();

  Future<void> generatePlan({
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
      state = state.copyWith(isLoading: false, plan: plan);
    } on AiServiceException catch (error) {
      state = state.copyWith(
        isLoading: false,
        plan: null,
        errorMessage: error.message,
      );
    } on FormatException catch (error) {
      state = state.copyWith(
        isLoading: false,
        plan: null,
        errorMessage: error.message,
      );
    }
  }
}

class PlanGenerationState {
  const PlanGenerationState({
    this.isLoading = false,
    this.plan,
    this.errorMessage,
  });

  final bool isLoading;
  final TrainingPlan? plan;
  final String? errorMessage;

  PlanGenerationState copyWith({
    bool? isLoading,
    TrainingPlan? plan,
    bool clearPlan = false,
    String? errorMessage,
  }) {
    return PlanGenerationState(
      isLoading: isLoading ?? this.isLoading,
      plan: clearPlan ? null : (plan ?? this.plan),
      errorMessage: errorMessage,
    );
  }
}
