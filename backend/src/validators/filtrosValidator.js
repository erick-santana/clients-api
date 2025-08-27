const Joi = require('joi');
const { AppError } = require('../middleware/errorHandler');

const filtrosSchema = Joi.object({
  saldoMin: Joi.number()
    .precision(2)
    .min(0)
    .optional()
    .messages({
      'number.min': 'Saldo mínimo não pode ser negativo',
      'number.precision': 'Saldo mínimo deve ter no máximo 2 casas decimais'
    }),
  
  saldoMax: Joi.number()
    .precision(2)
    .min(0)
    .optional()
    .messages({
      'number.min': 'Saldo máximo não pode ser negativo',
      'number.precision': 'Saldo máximo deve ter no máximo 2 casas decimais'
    }),
  
  dataInicio: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Data início deve estar no formato YYYY-MM-DD'
    }),
  
  dataFim: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Data fim deve estar no formato YYYY-MM-DD'
    }),
  
  ordenarPor: Joi.string()
    .valid('nome', 'email', 'saldo', 'created_at', 'id')
    .optional()
    .default('created_at')
    .messages({
      'any.only': 'Campo de ordenação deve ser nome, email, saldo, id ou created_at'
    }),
  
  ordenacao: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
    .messages({
      'any.only': 'Ordenação deve ser asc ou desc'
    })
});

const validateFiltros = (filtros) => {
  const { error, value } = filtrosSchema.validate(filtros, { abortEarly: false });
  
  if (error) {
    const messages = error.details.map(detail => detail.message);
    throw new AppError(messages.join(', '), 400);
  }
  
  // Validações customizadas
  const validacoesCustomizadas = [];
  
  // Validar se saldo máximo é maior que saldo mínimo
  if (value.saldoMin !== undefined && value.saldoMax !== undefined) {
    if (value.saldoMax < value.saldoMin) {
      validacoesCustomizadas.push('O saldo máximo não pode ser menor que o saldo mínimo');
    }
  }
  
  // Validar se data fim é maior que data início
  if (value.dataInicio && value.dataFim) {
    const dataInicio = new Date(value.dataInicio);
    const dataFim = new Date(value.dataFim);
    
    if (dataFim < dataInicio) {
      validacoesCustomizadas.push('A data fim não pode ser menor que a data início');
    }
  }
  
  if (validacoesCustomizadas.length > 0) {
    throw new AppError(validacoesCustomizadas.join(', '), 400);
  }
  
  return value;
};

module.exports = {
  validateFiltros
};
