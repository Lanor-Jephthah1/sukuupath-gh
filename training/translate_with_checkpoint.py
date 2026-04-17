from __future__ import annotations

import argparse

from transformers import AutoModelForSeq2SeqLM, AutoTokenizer


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run a quick translation using a fine-tuned checkpoint or base model."
    )
    parser.add_argument("--model-path", required=True, help="Checkpoint directory or model name.")
    parser.add_argument("--source-lang", required=True, help="Tokenizer source language tag.")
    parser.add_argument("--target-lang", required=True, help="Tokenizer target language tag.")
    parser.add_argument("--text", required=True, help="Text to translate.")
    parser.add_argument("--max-new-tokens", type=int, default=192)
    parser.add_argument("--num-beams", type=int, default=4)
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    tokenizer = AutoTokenizer.from_pretrained(
        args.model_path,
        src_lang=args.source_lang,
        tgt_lang=args.target_lang,
    )
    model = AutoModelForSeq2SeqLM.from_pretrained(args.model_path)

    inputs = tokenizer(args.text, return_tensors="pt")
    forced_bos_token_id = None
    if hasattr(tokenizer, "lang_code_to_id") and args.target_lang in tokenizer.lang_code_to_id:
        forced_bos_token_id = tokenizer.lang_code_to_id[args.target_lang]

    generated = model.generate(
        **inputs,
        forced_bos_token_id=forced_bos_token_id,
        max_new_tokens=args.max_new_tokens,
        num_beams=args.num_beams,
    )
    print(tokenizer.batch_decode(generated, skip_special_tokens=True)[0].strip())


if __name__ == "__main__":
    main()
