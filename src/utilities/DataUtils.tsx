/**
 * Utility to parse a boolean-like string into a proper boolean type.
 *
 * @param boolString boolean-like string
 */
 const parseBoolString = (boolString: string): boolean => {
    let bool = false;
    if (boolString) {
      switch (boolString.toLowerCase()) {
        case "true":
        case "yes":
        case "1":
          bool = true;
          break;
        default:
          bool = false;
      }
    }
    return bool;
  }
  
  export default parseBoolString;