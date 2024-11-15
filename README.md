# Devlog Entry - [11-15-24]

## Introducing The Team

- **CJ Moshy** (Tools Lead)
- **Elton Zeng** (Engine Lead)
- **Zeke Davidson** (Design Lead)

## Tools and Materials

1. **Engines, Libraries, & Frameworks**
   - Our team will begin development with the Phaser 3 platform for web games, as we have extensive experience with this framework.
   - Our game will feature a 2D, pixel art style.
   - We will use the V8 engine running on Deno for development.
   - We will deploy prototypes to GitHub Pages.

2. **Programming Languages and Data Languages**
   - Initially, our team will use TypeScript, then switch to C# in the second half of our project.
   - We choose TSC initially because we all have experience with it and feel comfortable developing Phaser Games
   - We are experimenting with simple custom DSLs for subroutines in our software.
   - We realistically plan to use something like JSON or SQL (with a PostgreSQL-backed database) for data storage.

3. **Expected Tools**
   - VS Code (standard IDE for this project)
   - Deno (provides development environment runtime, linter, and formatter)
   - Git (version control)
   - Tiled: We will build our tilemaps on Tiled so, when we switch from Phaser to Unity, we can import the entire map seamlessly.
   - All of these tools were selected with confidence as we are all experienced with them. 
4. **Alternate Platform Choice**
   - Our group will transition from Phaser 3 to Unity for the required platform switch.
   - We plan to use Brace to convert as much of the codebase as possible, manually resolving the rest.
   - Ideally, our initial game will have strong programming principles enforced, making the language swap primarily a syntactical change.
   - Our team is experimenting with writing a wrapper around Phaser that behaves more like Unity to facilitate the conversion of scripts.

## Outlook

Our team focuses not only on creating a solid submission for the final but also on emphasizing the programming principles and practices we've been learning and practicing this quarter. We anticipate that the transition from a web-based game (Phaser/TypeScript) to a desktop game (Unity/C#) will be challenging. However, we plan to enforce programming rules that will hopefully ease this transition. Our team hopes to write code that is universally comprehensible and therefore easy to transpile from language to language.