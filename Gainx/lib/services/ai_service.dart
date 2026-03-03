import 'package:cloud_functions/cloud_functions.dart';

import '../models/training_plan.dart';

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

class AiServiceException implements Exception {
  const AiServiceException(this.message);

  final String message;

  @override
  String toString() => message;
}
