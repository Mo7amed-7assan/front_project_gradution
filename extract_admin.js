const fs = require('fs');
const data = JSON.parse(fs.readFileSync('Co-Found Platform API.openapi.json'));
const paths = Object.keys(data.paths).filter(p => p.includes('admin'));

const result = [];
paths.forEach(p => {
    Object.keys(data.paths[p]).forEach(m => {
        const op = data.paths[p][m];
        const params = op.parameters ? op.parameters.map(param => ({
            name: param.name, 
            in: param.in, 
            required: param.required
        })) : [];
        
        let body = 'no body';
        if (op.requestBody && op.requestBody.content && op.requestBody.content['application/json']) {
            const schema = op.requestBody.content['application/json'].schema;
            // extract properties if available
            if (schema.$ref) {
                body = `Ref: ${schema.$ref}`;
            } else if (schema.properties) {
                body = `Properties: ${Object.keys(schema.properties).join(', ')}`;
            } else {
                body = 'has body (unknown structure)';
            }
        }
        
        result.push(`${m.toUpperCase()} ${p}`);
        result.push(`  Params: ${JSON.stringify(params)}`);
        result.push(`  Body: ${body}`);
    });
});
fs.writeFileSync('admin_endpoints.txt', result.join('\n'));
console.log('Done!');
