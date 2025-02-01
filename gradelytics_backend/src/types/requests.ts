import { t } from 'elysia';

export const CalculationSchema = t.Object({
  type: t.Union([t.Literal('gpa'), t.Literal('cgpa')]),
  semester: t.Optional(t.String()),
  result: t.Number(),
  details: t.Any()
});

export const DeleteParamsSchema = t.Object({
  id: t.String()
}); 