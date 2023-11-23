export interface SanitizationMetadata {
  /**
   * The property names of the object to keep.
   */
  include?: string[];

  /**
   * The property names of the object to remove.
   */
  exclude?: string[];

  /**
   * The path to the property to be sanitized. If not provided, the whole
   * object will be sanitized.
   */
  key?: string;
}
