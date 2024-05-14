export interface SQLComponent {
    order: number;
    type: string;
    value?: string;
    operator?: string;
    children?: SQLComponent[];
    relationalAlgebra?: string;
}