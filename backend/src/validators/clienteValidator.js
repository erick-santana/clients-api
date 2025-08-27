const Joi = require('joi');
const { AppError } = require('../middleware/errorHandler');

const clienteSchema = Joi.object({
  nome: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
    .required()
    .messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres',
      'string.pattern.base': 'Nome deve conter apenas letras e espaços',
      'any.required': 'Nome é obrigatório'
    }),
  
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(255)
    .required()
    .messages({
      'string.email': 'Email deve ser válido',
      'string.max': 'Email deve ter no máximo 255 caracteres',
      'any.required': 'Email é obrigatório'
    }),
  
  saldo: Joi.number()
    .precision(2)
    .min(0)
    .optional()
    .messages({
      'number.min': 'Saldo não pode ser negativo',
      'number.precision': 'Saldo deve ter no máximo 2 casas decimais'
    })
});

const operacaoSchema = Joi.object({
  valor: Joi.number()
    .precision(2)
    .positive()
    .required()
    .messages({
      'number.positive': 'Valor deve ser positivo',
      'number.precision': 'Valor deve ter no máximo 2 casas decimais',
      'any.required': 'Valor é obrigatório'
    })
});

const idSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'ID deve ser um UUID válido',
      'any.required': 'ID é obrigatório'
    })
});

const validateCliente = (data) => {
  const { error, value } = clienteSchema.validate(data, { abortEarly: false });
  if (error) {
    const messages = error.details.map(detail => detail.message);
    throw new AppError(messages.join(', '), 400);
  }
  return value;
};

const validateOperacao = (data) => {
  const { error, value } = operacaoSchema.validate(data, { abortEarly: false });
  if (error) {
    const messages = error.details.map(detail => detail.message);
    throw new AppError(messages.join(', '), 400);
  }
  return value;
};

const validateId = (data) => {
  const { error, value } = idSchema.validate(data, { abortEarly: false });
  if (error) {
    const messages = error.details.map(detail => detail.message);
    throw new AppError(messages.join(', '), 400);
  }
  return value;
};

module.exports = {
  validateCliente,
  validateOperacao,
  validateId
};
