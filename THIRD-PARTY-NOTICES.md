# Third-party assets

## Fuecoco app icon

Requested by the owner. The 64 × 64 indexed front sprite is copied unchanged from `graphics/pokemon/fuecoco/front.png` at Emerald: Legends commit `7cf9a7bfcb515ad33b4840ce38cd7d2e88008b8d`. The icon sizes use nearest-neighbor enlargement, with no repainting.

Source: https://github.com/BabyCRTTV/pokeemerald-emerald-legends/blob/7cf9a7bfcb515ad33b4840ce38cd7d2e88008b8d/graphics/pokemon/fuecoco/front.png

Based on RHH/pokeemerald-expansion. Credit RHH and its sprite contributors: https://github.com/rh-hideout/pokeemerald-expansion/blob/master/CREDITS.md . Pokémon and Fuecoco are properties of their respective rights holders; this independent companion tool claims no affiliation or ownership of that artwork. No ROM data is included.

## Optional local assistant

Downloads happen only after a user chooses Load local AI. Inference happens on the device; download hosts receive asset requests, not project files or review prompts.

- Transformers.js **3.8.1**, Apache-2.0: https://github.com/huggingface/transformers.js/tree/3.8.1 . Runtime assets are loaded from the pinned npm package on jsDelivr.
- ONNX Runtime bundled by that package **1.21.0**, MIT: https://github.com/microsoft/onnxruntime/tree/v1.21.0 . Single-thread CPU/WASM.
- HuggingFaceTB **SmolLM2-360M-Instruct**, Apache-2.0: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct . Conversion: https://huggingface.co/onnx-community/SmolLM2-360M-Instruct-ONNX at revision `fe7c7db4c8921c9e3fa1c65cfd296fb3b1b1a8f9`, `model_quantized.onnx` / q8. Model file 363,115,149 bytes, WASM runtime 21,596,019 bytes, plus tokenizers/configuration/JS. Cached where supported.

The model is a small general text model, not a certified bug finder or interpreter for game scripts. It receives bounded descriptions of source findings, has no source-write capability and cannot execute its output.

## ZIP compression

fflate, MIT. License retained in dist/vendor/fflate-LICENSE.
