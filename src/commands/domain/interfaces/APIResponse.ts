export type APIResponse<dataType> =
    | {
          isError: false;
          data: dataType;
      }
    | {
          isError: true;
          data: null;
          errorData: TypeError;
      };
