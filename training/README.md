# Translation Training

This folder contains a clean workflow for fine-tuning a translation model on the Ghana NLP parallel datasets already in the repo.

## Recommended base model

- `facebook/nllb-200-distilled-600M`

This is the recommended starting point for:
- `eng_Latn -> twi_Latn`
- `twi_Latn -> eng_Latn`
- `ewe_Latn -> eng_Latn`

## Files

- `translation_config.py`: dataset and language-tag metadata
- `prepare_translation_data.py`: clean CSV data and create train/validation JSONL files
- `train_nllb_translation.py`: fine-tune the model with Hugging Face `Seq2SeqTrainer`
- `translate_with_checkpoint.py`: run inference on a saved checkpoint
- `requirements.txt`: training-only Python dependencies

## Quick start

Use Python `3.10` or `3.11`.

```powershell
py -3.11 -m venv .venv-train
.\.venv-train\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r training\requirements.txt
python training\prepare_translation_data.py --dataset ENGLISH_TWI_PARALLEL_TEXT
python training\train_nllb_translation.py `
  --train-file training\processed_data\english_twi_parallel_text\train.jsonl `
  --validation-file training\processed_data\english_twi_parallel_text\validation.jsonl `
  --source-lang eng_Latn `
  --target-lang twi_Latn `
  --output-dir training\checkpoints\nllb-eng-twi
```

## Notes

- The Ghana NLP downloads only include `train.csv`, so the prep step creates a validation split automatically.
- The prep step also normalizes whitespace and attempts to repair text encoding issues using `ftfy`.
- The NLLB training script validates tokenizer language tags before training starts.
- `Ga`, `Fante`, and `Kusaal` are preprocessed too, but they are not flagged as NLLB-ready in this first-pass setup.
