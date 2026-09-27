// OCR d'images PNG avec le framework Vision de macOS (français).
// Usage : swift scripts/ocr.swift page-1.png page-2.png … > sortie.txt
import Foundation
import Vision
import AppKit

for (i, path) in CommandLine.arguments.dropFirst().enumerated() {
  guard let img = NSImage(contentsOfFile: path),
        let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else { continue }
  let req = VNRecognizeTextRequest()
  req.recognitionLevel = .accurate
  req.recognitionLanguages = ["fr-FR"]
  req.usesLanguageCorrection = true
  try? VNImageRequestHandler(cgImage: cg).perform([req])
  let lines = (req.results ?? [])
    .sorted { $0.boundingBox.minY > $1.boundingBox.minY }
    .compactMap { $0.topCandidates(1).first?.string }
  if i > 0 { print("\u{0C}", terminator: "") }
  print(lines.joined(separator: "\n"))
}
