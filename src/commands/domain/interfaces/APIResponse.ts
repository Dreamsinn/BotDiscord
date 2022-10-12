export interface APIResponse<dataType> {
    isError: boolean;
    data: dataType;
    errorData?: TypeError;
}
