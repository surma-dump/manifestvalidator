const validDisplayModes = ['fullscreen', 'standalone', 'minimal-ui', 'browser'];
const validOrientations = ['any', 'natural', 'landscape', 'portrait', 'portrait-primary', 'portrait-secondary', 'landscape-primary', 'landscape-secondary'];
const manifestValidator = {
  'display': [
    {
      isInvalid: v => v in validDisplayModes,
      error: err => [`display mode must be one of ${JSON.stringify(validDisplayModes)}`]
    }
  ],
  'lang': [
    {
      isInvalid: checkString,
      error: err => ['lang must be a string or undefined']
    }
  ],
  'name': [
    {
      isInvalid: checkString,
      error: err => ['name must be a string']
    }
  ],
  'short_name': [
    {
      isInvalid: checkString,
      error: err => ['short_name must be a string']
    }
  ],
  'scope': [
    {
      isInvalid: checkString,
      error: err => ['scope must be a string']
    },
    {
      // FIXME: Base URL
      isInvalid: checkString,
      error: err => [`scope must be a valid URL (${err})`]
    }
  ],
  'splash_screens': [
    {
      isInvalid: checkArray,
      error: err => ['splash_screens must be an array']
    },
    {
      isInvalid: v =>
        v.map((v, idx) =>
          validateObject(v, imageItemValidator)
            .map(error => `splash_screens[${idx}].${error}`)),
      error: err => err.reduce((prev, cur) => prev.concat(...cur))
    }
  ],
  'icons': [
    {
      isInvalid: checkArray,
      error: err => ['icons must be an array']
    },
    {
      isInvalid: v =>
        v.map((v, idx) =>
          validateObject(v, imageItemValidator)
            .map(error => `icons[${idx}].${error}`)),
      error: err => err.reduce((prev, cur) => prev.concat(...cur))
    }
  ],
  'orientation': [
    {
      isInvalid: v => v in validOrientations,
      error: err => [`orientation mode must be one of ${JSON.stringify(validOrientations)}`]
    }
  ],
  'start_url': [
    {
      // FIXME: Base URL
      isInvalid: checkString,
      error: err => ['start_url must be a string']
    },
    {
      // FIXME: Base URL
      isInvalid: checkString,
      error: err => [`start_url must be a valid URL (${err})`]
    }
  ],
  'theme_color': [
    {
      isInvalid: checkString,
      error: err => ['theme_color must be a string']
    }
  ],
  'related_applications': [
    {
      isInvalid: v => checkArray,
      error: err => ['related_applications must be an array']
    },
    {
      isInvalid: v =>
        v.map((v, idx) =>
          validateObject(v, relatedApplicationsValidator)
            .map(error => `related_applications[${idx}].${error}`)),
      error: err => err.reduce((prev, cur) => prev.concat(...cur))
    },
  ],
  'prefer_related_applications': [
    {
      isInvalid: checkBoolean,
      error: err => ['prefer_related_applications must be a boolean']
    }
  ],
  'background_color': [
    {
      isInvalid: checkString,
      error: err => ['background_color must be a string']
    }
  ],
};

const imageItemValidator = {
  'src': [
    {
      isInvalid: checkString,
      error: err => ['src must be a string']
    }
  ],
  'type': [
    {
      isInvalid: checkString,
      error: err => ['type must be a string']
    },
    {
      isInvalid: v => v.indexOf('/') === -1,
      error: err => ['type must be a valid mime-type']
    }
  ],
  'sizes': [
    {
      isInvalid: checkString,
      error: err => ['sizes must be a string']
    },
    {
      isInvalid: v => !/([0-9]+[xX][0-9]+(\s[0-9]+[xX][0-9]+)*|any)/.test(v),
      error: err => ['sizes has invalid format']
    }
  ],
  'density': [
    {
      isInvalid: checkNumber,
      error: err => ['density must be a number']
    }
  ]
};

const relatedApplicationsValidator = {
  'platform': [
    {
      isInvalid: checkString,
      error: err => ['platform must be a string']
    }
  ],
  'id': [
    {
      isInvalid: checkString,
      error: err => ['id must be a string']
    }
  ],
  'url': [
    {
      isInvalid: checkString,
      error: err => ['url must be a string']
    }
  ]
};

function checkString(v) {
  return typeof v !== 'string';
}

function checkArray(v) {
  return !Array.isArray(v);
}

function checkNumber(v) {
  return typeof v !== 'number';
}

function checkBoolean(v) {
  return typeof v !== 'boolean';
}

function validateObject(obj, validator) {
  let errs = [];

  Object.keys(obj).forEach(key => {
    if(!validator.hasOwnProperty(key)) {
      errs.push(`Unknown property "${key}"`);
      return;
    }
    const value = obj[key];
    validator[key].forEach(v => {
      const err = v.isInvalid(value);
      if(err) {
        errs.push(...v.error(err));
      }
    });
  });

  return errs;
}

export default (manifest) => {
  return validateObject(manifest, manifestValidator);
}
