**COMBAT**  
Gsheets \- [E.R.A ✦ COMBAT](https://docs.google.com/spreadsheets/d/1l7eMfK7H8aKgPX5juzTdFblJ6fhIoIgbFDvQRjwjDb4/edit?gid=452142756#gid=452142756)

**THE GIST OF IT**

- Runtime combat records live in the `spellcaster_combat_characters` PostgreSQL table in the shared database; Google Sheets is not read at runtime.

- Everyone can roll the same commands, but it takes different values based on their sheet tab (chara gets their own tab)  
  - E.g. depending on which chara, it gets the data from specific tab ID  
- I think better to save all the info into a cache….? (reload cache command too) bc combat is going to do a lot of sheet reading and it deadass might reach limit  
  - Or db? And then command to sync sheets with db………? Since the future commands get complex with cooldowns and shit it might be better…?

**CELL REFERENCES**
- This was made with using GoogleSheets as a database in mind. So the following are the actual variable names of the cells:
  - I22: INT
  - I23: CHA
  - I24: WIS
  - I25: WILL
  - I26: STR
  - I27: DEX
  - AH10: HP
  - AH14: MP
  - H33: Skill roll modifier; also modified by /modbuff and /moddebuff
  - H34: MGT mod
  - H35: MAG mod
  - H36: RES mod
  - H37: ESN mod
  - H38: ARC mod
  - AJ28: Attacking base
  - AL28: Attacking crit
  - AJ29: Healing base
  - AL29: Healing crit
  - L9, L19, L29, L39: Skill names (use Skill 1 through Skill 4 as temporary display names)
  - Y9, Y19, Y29, Y39: Skill types (DPS, DOT, HEAL, etc.)
  - Q15, Q25, Q35, Q45: Skill damage/effect values
  - Q16, Q26, Q36, Q46: Skill crit damage/effect values
  - Y15, Y25, Y35, Y45: Skill MP drain
  - Y16, Y26, Y36, Y46: Skill cooldown
  - Y17, Y27, Y37, Y47: Skill active turns
  

**COMMANDS**  
/stats		displays someone’s stats (CBT and NON CBT tables) and their HP, MP, AC  
/int		1d20+**I22**  
/cha		1d20+**I23**  
/wis		1d20+**I24**  
/will		1d20+**I25**  
/str		1d20+**I26**  
/dex		1d20+**I27**	

/hp			display your HP **AH10,** and MP **AH14**  
/takedmg \<dmg\>	takes damage (-HP)

They can only do one of these per turn:

/dodge \<dmg\>\<ac\>	1d20+**H35**, if above or equal ac, no dmg. If within 3 pts, receive half of dmg  
/block \<dmg\>\<ac\>	1d20+**H36**, if above ac, you full block and receive half of the dmg  
/attack \<ac\>		1d20+**H34**, if above ac, deal damage with **AJ28**, if you roll a 20+, **AL28**  
/heal \<chara\>		1d20+**H37**, heal **AJ29** to charas hp, if 20+, **AL29** (no chara \= self heal)

/newturn		prompts new turn (and for future cooldown skill tracking)

/resetstats		sets HP and MP back to normal

—-

(can do this in the future)  
This is due in like january hahaha

**New stat**

- not in sheet, but each chara would now have a “shield” stat, which is basically how much damage can be tanked by that shield before you receive actual damage.  
- I.e. if you have a shield of 10 and the enemy deals 20 damage, you only get 10 damage  
  - If the enemy deals 5 damage, your shield is down to 5 and you receive 0 damage  
- Resetstats command will also set shield back to 0

**/modbuff \<num\>**	adds \+num to ur H33 stat  
**/moddebuff \<num\>** 	minus \-num to ur H33 stat  
**/statuseffects**		displays list of ur skills \+ cooldowns, and also any active skills (DoT, MoT, etc)

**/skill \<chara\>**

- Depending on **\<chara\>**, it would display a dropdown of available skills to use (**L9, L19, L29, L39**; temporary names: Skill 1, Skill 2, Skill 3, Skill 4)
- All of these, bot rolls **1d20+H33**, if above 13, success. If 20+, crit.  
- Regardless of success, using a skill drains **MP DRAIN** value from their MP.  
- Cooldown \= can’t use that skill again till cooldown is back at 0 (see /newturn)  
- Turns Active \= e.g. DoT, you deal 10 damage for 5 rounds. So for every /newturn it should still be active for how many turns its active for  
    
  So for every /skill use, it should display:  
- The actual skill effect \+ description  
- Show which skills is currently still active (i.e. DoT, etc)  
- Show which skills are available to use (not in cooldown)


| IF DROPDOWN (Y9) IS | EFFECT OF VALUE Q15 (or if crit Q16) |
| :---- | :---- |
| DPS | Prompt to input enemy AC,  Deal damage if the 1d20 result is over AC |
| DOT | Same prompt as above Deal damage over \[TURNS ACTIVE\] turns Cooldown starts after last active turn |
| HEAL | Prompt to choose which chara (dropdown..?), then heals their hp (their own name is included) |
| HOT | ^same as above but over time like DoT |
| MP | Same as heal but MP |
| MOT | Same as HoT |
| INTERCEPT | Prompt to choose which chara, then gives them a shield of X amount |
| RALLY | Prompt to choose which chara, then it does /modbuff for X amount (None is an option in case they are buffing someone thats not in the dropdown, in this case it just displays text) |
| WEAKEN | Prompt to choose which chara, then it does /moddebuff for X amount (None is an option in case they are buffing someone thats not in the dropdown, in this case it just displays text) |
| AGGRO | Just display text aggro is successful or somn |
| STUN | Same as above |
| VULNERABLE | “Enemy AC is down by X" display text |
