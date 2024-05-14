import { SQLComponent } from "@/interfaces/SQLComponent";

export class SQLParser {
    parse(sqlQuery: string): SQLComponent {
        let order = 1; // Initialize order counter
        const parsedSQL: SQLComponent = {
            type: 'SELECT',
            children: [],
            order: 0,
            relationalAlgebra: '',
        };

        // regex
        const selectRegex = /SELECT(.+?)FROM/i;
        const fromRegex = /FROM(.+?)(?:WHERE|JOIN|$)/i;
        const whereRegex = /WHERE\s*(.+?)(?=(AND|\)|$))/gi;
        const andRegex = /AND\s*(.+?)(?=(AND|\)|$))/gi;
        const joinRegex = /JOIN(.+?)ON/gi;

        // SELECT
        const selectMatch = sqlQuery.match(selectRegex);
        if (selectMatch && selectMatch[1]) {
            const selectColumns = selectMatch[1].split(',');
            parsedSQL.children = selectColumns.map(column => ({
                type: 'COLUMN',
                value: column.trim(),
                order: order++,
                relationalAlgebra: `π ${column.trim()}`,
            }));
        }

        // FROM
        const fromMatch = sqlQuery.match(fromRegex);
        if (fromMatch && fromMatch[1]) {
            const tableName = fromMatch[1].trim();
            parsedSQL.children?.push({
                type: 'FROM',
                value: tableName,
                order: order++,
                relationalAlgebra: tableName,
            });
        }

        //  WHERE
        const whereMatches = sqlQuery.matchAll(whereRegex);
        for (const match of whereMatches) {
            if (match && match[1]) {
                const condition = match[1].trim();
                parsedSQL.children?.push({
                    type: 'WHERE',
                    value: condition,
                    order: order++,
                    relationalAlgebra: `σ ${condition}`,
                });
            }
        }

        // AND
        const andMatches = sqlQuery.matchAll(andRegex);
        for (const match of andMatches) {
            if (match && match[1]) {
                const condition = match[1].trim();
                parsedSQL.children?.push({
                    type: 'AND',
                    value: condition,
                    order: order++,
                    relationalAlgebra: ` ∧ ${condition}`,
                });
            }
        }

        // JOIN
        let joinMatch;
        while ((joinMatch = joinRegex.exec(sqlQuery)) !== null) {
            if (joinMatch && joinMatch[1]) {
                const joinTable = joinMatch[1].trim();
                parsedSQL.children?.push({
                    type: 'JOIN',
                    value: joinTable,
                    order: order++,
                    relationalAlgebra: ` ⨝ ${joinTable}`,
                });
            }
        }

        parsedSQL.relationalAlgebra = parsedSQL.children?.map(child => child.relationalAlgebra).join('');

        return parsedSQL;
    }
}