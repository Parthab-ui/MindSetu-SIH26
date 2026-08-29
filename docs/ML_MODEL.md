# Research ML model

The repository includes a LightGBM model for SIH26186 research demonstration.

## Purpose

The model provides a research support signal and is not a clinical diagnosis engine or autonomous decision-maker.

## Inputs

The runtime health endpoint exposes the feature list and threshold used by the bundled model.

## Explainability

SHAP utilities are used to explain feature contributions to a model output.

## Validation and limitations

The repository runtime demonstrates inference and explanation. Claims about model accuracy, generalization, fairness or operational suitability must be supported by the training and evaluation artifacts for the specific dataset. Do not infer production validity solely from a successful health check.

## Evaluation checklist

Before presenting model-performance claims, document:

1. dataset source and permitted use;
2. preprocessing and feature definitions;
3. train/validation/test methodology;
4. metrics and confusion matrix;
5. threshold selection rationale;
6. limitations and potential bias.
