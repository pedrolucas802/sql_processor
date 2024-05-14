export interface OperatorGraphNode {
    id: number;
    type: string; //operador | tabela |constante
    value: string;
    children: OperatorGraphNode[];
}