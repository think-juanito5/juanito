# Power Apps Connector (pac)

Allows Power Apps to connect to Johnny5 Services and Actionstep  
Mutates responses into Power Apps (Swagger 2.0) readable format  
The definition for the Power Apps side stored in cca.integration.services/powerapps/johnny5
pac cli (powershell), or    
paconn cli (preferred) (pip install paconn) required to update the connector definitions in Power Apps (paconn) development environment

To install dependencies:

```bash
bun install
pip install paconn
```

To update the Power Apps Connector definitions on the power apps side in the development environment
```bash
cd cca.integration.services/powerapps/shared_dbc-5fcca-20-2d-201-5fd94596a0e5358ac4
paconn login
paconn validate -d apiDefinition.swagger.json
paconn update -d apiDefinition.swagger.json -p apiProperties.json -i icon.png -c shared_dbc-5fcca-20-2d-201-5fd94596a0e5358ac4 -e Default-20662f19-dcf5-43db-861d-23acdd8eeb44 --verbose
```
Ensure that you use the Power Apps deployment pipeline to deploy the connector to stage for testing and then prod. Do not update directly from the cli  

To run:

```bash
bun run src/index.ts
```

This project was created using `bun init` in bun v1.2.4. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
