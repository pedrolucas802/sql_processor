<template>
  <div class="script-container">
    <span>SCRIPT:</span>
    <Textarea v-model="input"></Textarea>
  </div>
  <Button label="RUN" @click="onSubmit()" />
  <div class="output-container">
    <span>OUTPUT:</span>
    {{ output }}
  </div>

  <div class="output-container">
    <span>PARSED SQL:</span>
    {{ parsed_sql }}
  </div>

  <div class="output-container">
    <span>GRAPH:</span>
    {{ graph_output }}
  </div>

  <div class="output-container">
    <span>IMPROVED GRAPH:</span>
    {{ improved_graph_output }}
  </div>
</template>
<script lang="ts">
import {defineComponent} from "vue";
import Button from "primevue/button";
import Textarea from "primevue/textarea";
import type {Table} from "@/interfaces/Table";
import tables from "@/scripts/tables.json";
import {SQLParser} from "@/interfaces/SQLParser";
import {SQLComponent} from "@/interfaces/SQLComponent";

export default defineComponent({
  components: {
    Button,
    Textarea
  },
  data() {
    return {
      schema: [] as Table[],
      input: 'Select cliente.nome, pedido.idPedido, pedido.DataPedido, pedido.ValorTotalPedido from Cliente Join pedido on cliente.idcliente = pedido.Cliente_idCliente where cliente.TipoCliente_idTipoCliente = 1 and pedido.ValorTotalPedido = 0;' as string,
      output: '' as string,
      graph_output: '' as string,
      improved_graph_output: '' as string,
      parsed_sql: {} as any,
    };
  },
  methods: {
    onSubmit() {
      let valid = true
      if (!this.validateSyntax(this.input)) {
        valid = false
        this.output = 'Invalid syntax in the SQL query.';
        return;
      }

      if (!this.validateTablesColumns(this.input)) {
        valid = false
        this.output = 'The SQL query contains invalid tables or columns.';
        return;
      }

      if (valid){
        const parser = new SQLParser();
        const parsedSQL = parser.parse(this.input);
        if (parsedSQL) {
          this.parsed_sql = parsedSQL
          this.output += this.convertToRelationalAlgebra(parsedSQL)
          this.graph_output +=this.printOperatorGraph(parsedSQL, 0, true, '');
          let improved = this.applyReduceTupleHeuristic(parsedSQL);
          this.improved_graph_output += this.printOperatorGraph(improved, 0, true, '');

          this.logStuff()

        }
      }

    },
    validateSyntax(query: string): boolean {
      const parser = new SQLParser();
      const parsedSQL = parser.parse(query);
      return !!parsedSQL;
    },

    validateTablesColumns(query: string): boolean {
      const parser = new SQLParser();
      const parsedSQL = parser.parse(query);

      if (!parsedSQL || !parsedSQL.children) {
        return false;
      }

      for (const table of parsedSQL.children) {
        if (table.type === 'FROM' || table.type === 'JOIN') {
          if (!this.schema.some(s => s.tableName.toUpperCase() === table.value?.toUpperCase())) {
            return false;
          }
        }
      }

      for (const column of parsedSQL.children) {
        if (column.type === 'COLUMN' && column.value) {
          const splitValue = column.value.split('.');
          if (splitValue.length === 2) {
            const [tableName, columnName] = splitValue;
            const table = this.schema.find(table => table.tableName.toUpperCase() === tableName.toUpperCase());
              if(!(table && table.attributes.some(attr => attr.name.toUpperCase() === columnName.toUpperCase()))){
                return false
              }
          }
        }
      }

      return true;
    },

    convertToRelationalAlgebra(parsedSQL: SQLComponent): string {
      let relationalAlgebra = '';

      const selectClause = parsedSQL.children?.find(child => child.type === 'SELECT');
      const fromClause = parsedSQL.children?.find(child => child.type === 'FROM');
      const joinClauses = parsedSQL.children?.filter(child => child.type === 'JOIN');
      const whereClause = parsedSQL.children?.find(child => child.type === 'WHERE');
      const andClauses = parsedSQL.children?.filter(child => child.type === 'AND');

      if (selectClause) {
        const selectColumns = selectClause.children?.map(child => child.value).join(', ');
        relationalAlgebra += `π ${selectColumns}\n`;
      }

      if (fromClause) {
        relationalAlgebra += `${fromClause.value}`;
      }

      if (joinClauses) {
        joinClauses.forEach(join => {
          relationalAlgebra += ` ⨝ ${join.value} `;
        });
      }

      if (whereClause) {
        relationalAlgebra += `\nσ ${whereClause.value}`;
      }

      if (andClauses) {
        andClauses.forEach(and => {
          relationalAlgebra += ` ∧ ${and.value}`;
        });
      }

      return relationalAlgebra;
    },

    applyReduceTupleHeuristic(parsedSQL: SQLComponent): SQLComponent {
      let order = 1;
      parsedSQL.children?.filter(child => child.type === 'COLUMN').forEach(child => {
        child.order = order++;
      });

      parsedSQL.children?.filter(child => child.type === 'FROM').forEach(child => {
        child.order = order++;
      });
      const whereClauses = parsedSQL.children?.filter(child => child.type === 'WHERE');
      const prioritizedOperators = ['=', '>=', '<=']; // Prioritized operators for WHERE
      prioritizedOperators.forEach(operator => {
        whereClauses?.filter(child => child.operator === operator).forEach(child => {
          child.order = order++;
        });
      });
      whereClauses?.filter(child => !prioritizedOperators.includes(child.operator || '')).forEach(child => {
        child.order = order++;
      });
      const andClauses = parsedSQL.children?.filter(child => child.type === 'AND');
      prioritizedOperators.forEach(operator => {
        andClauses?.filter(child => child.operator === operator).forEach(child => {
          child.order = order++;
        });
      });
      andClauses?.filter(child => !prioritizedOperators.includes(child.operator || '')).forEach(child => {
        child.order = order++;
      });

      return parsedSQL;
    },

    reduceFields() {
        console.log('\nField Reduction:');
    },

    printOperatorGraph(node: SQLComponent, level: number, isLastChild: boolean, prefix: string): string {
      const INDENT = '   ';
      const LINE = '│  ';
      const L_END = '└─ ';
      const BRANCH = '├─ ';

      let result = '';

      let indent = '';
      for (let i = 0; i < level; i++) {
        indent += (prefix[i] === ' ' ? INDENT : LINE);
      }

      let branch = BRANCH;
      if (isLastChild) {
        branch = L_END;
      }

      result += `${indent}${branch}${node.order}: ${node.type} - ${node.value}\n`;

      if (node.children && node.children.length > 0) {
        const sortedChildren = node.children.sort((a, b) => a.order - b.order);
        const childPrefix = prefix + (isLastChild ? '    ' : '│   ');
        for (let i = 0; i < sortedChildren.length; i++) {
          const isLast = i === sortedChildren.length - 1;
          result += this.printOperatorGraph(sortedChildren[i], level + 1, isLast, childPrefix);
        }
      }

      if (node.relationalAlgebra) {
        result += `${indent}     ${node.relationalAlgebra}\n`;
      }

      return result;
    },

    logStuff(){
      console.log("Parsed SQL - >  ",this.parsed_sql)
      console.log("Algebra - >  ",this.output)
      console.log("Graph - >  ",this.graph_output)
      console.log("Reduced tuples - >  ",this.improved_graph_output)
    }
  },
  created() {
    this.schema = tables;
  },
});
</script>
<style scoped>
textarea {
  background-color: black;
  color: rgb(0, 145, 255);
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
  width: 1240px !important;
  min-height: 360px;
  border: none;

}
.script-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 12px 0;
}
.output-container {
  display: flex;
  flex-direction: column;
  margin: 40px 0;
}
</style>
: string | any[]: any[](: string)(: string): any[](: string): string | any[]: string | any[]: any[](: string)(: string): any[](: string): string | any[]
