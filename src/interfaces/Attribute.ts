interface Attribute {
    name: string;
    dataType: string;
    isNotNull?: boolean;
    isAutoIncrement?: boolean;
    defaultValue?: any;
}