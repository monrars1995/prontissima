import { z } from "zod"

const PieceSchema = z.object({
  id: z.string().min(3, "ID da peça deve ter no mínimo 3 caracteres"),
  type: z.enum(["upper", "lower"], { errorMap: () => ({ message: "Type deve ser 'upper' ou 'lower'" }) }),
  description: z
    .string()
    .min(20, "Descrição deve ter no mínimo 20 caracteres")
    .refine((txt) => !/gen[eé]ric|coordenad|adequad|neutr/i.test(txt), {
      message: "Descrição genérica não permitida (evite: genérica, coordenada, adequada, neutra)",
    }),
})

export const LookSchema = z.object({
  lookId: z.enum(["A", "B"], { errorMap: () => ({ message: "lookId deve ser 'A' ou 'B'" }) }),
  upperPiece: PieceSchema,
  lowerPiece: PieceSchema,
  styling: z.object({
    sapato: z.string().min(20, "Descrição de sapato deve ter no mínimo 20 caracteres"),
    bolsa: z.string().min(20, "Descrição de bolsa deve ter no mínimo 20 caracteres"),
    acessorios: z.string().min(20, "Descrição de acessórios deve ter no mínimo 20 caracteres"),
    cabelo: z.string().min(10, "Sugestão de cabelo deve ter no mínimo 10 caracteres"),
    maquiagem: z.string().min(10, "Sugestão de maquiagem deve ter no mínimo 10 caracteres"),
  }),
  porqueFunciona: z
    .string()
    .min(50, "Explicação deve ter no mínimo 50 caracteres")
    .max(300, "Explicação deve ter no máximo 300 caracteres"),
  aiConfidence: z.number().min(0.8, "Confiança da IA deve ser no mínimo 80%").optional().default(0.95),
})

export function parseLookFromAI(rawLook: any): any {
  return {
    lookId: rawLook?.lookId || "A",
    upperPiece: {
      id: rawLook?.upperPiece?.id || "",
      type: rawLook?.upperPiece?.type || "upper",
      description: rawLook?.upperPiece?.description || "",
    },
    lowerPiece: {
      id: rawLook?.lowerPiece?.id || "",
      type: rawLook?.lowerPiece?.type || "lower",
      description: rawLook?.lowerPiece?.description || "",
    },
    styling: {
      sapato: rawLook?.styling?.sapato || "",
      bolsa: rawLook?.styling?.bolsa || "",
      acessorios: rawLook?.styling?.acessorios || "",
      cabelo: rawLook?.styling?.cabelo || "",
      maquiagem: rawLook?.styling?.maquiagem || "",
    },
    porqueFunciona: rawLook?.porqueFunciona || "",
    aiConfidence: rawLook?.aiConfidence || 0.95,
  }
}
