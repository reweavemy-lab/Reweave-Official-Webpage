import { Schema } from 'express-validator'

export const colorsSchema: Schema = {
  palette: {
    in: ['body'],
    isArray: true,
    notEmpty: true
  },
  'palette.*': {
    isString: true,
    trim: true
  },
  imageDescriptors: {
    optional: true,
    isArray: true
  }
}

export const outfitSchema: Schema = {
  occasion: {
    in: ['body'],
    isString: true,
    notEmpty: true,
    trim: true
  },
  palette: {
    in: ['body'],
    isArray: true,
    optional: true
  },
  budget: {
    in: ['body'],
    optional: true,
    isObject: true
  },
  'budget.min': {
    optional: true,
    isFloat: { options: { min: 0 } }
  },
  'budget.max': {
    optional: true,
    isFloat: { options: { min: 0 } }
  },
  preferences: {
    optional: true,
    isArray: true
  }
}

export const styleSchema: Schema = {
  products: {
    in: ['body'],
    isArray: true,
    notEmpty: true
  },
  'products.*.id': {
    optional: true,
    isString: true
  },
  'products.*.name': {
    isString: true,
    trim: true
  },
  'products.*.price': {
    isFloat: { options: { min: 0 } }
  },
  palette: {
    optional: true,
    isArray: true
  },
  profile: {
    optional: true,
    isObject: true
  }
}