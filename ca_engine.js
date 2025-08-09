function get_neighbourhood_index(neighbourhood, num_states){
	let sum = 0;
	for (let i = 0; i < 3; i++){
		sum += neighbourhood[i] * (num_states ** i);
	}
	return sum;
}

class Rule {
    constructor(instructions, num_states){
        this._instructions = instructions
        this._num_states = num_states
	}
    
    _mutate_instructions(mutation_rate){
        const copy_instructions = this._instructions.slice();
		
        for (const [x, i] of this._instructions.entries()) {
            if (Math.random() <= mutation_rate){
                copy_instructions[x] = Math.floor(Math.random() * (this._num_states - 1));
			}
		}
        return copy_instructions;
	}
    
    get_instructions() {
        return this._instructions;
	}
    
    get_num_states() {
        return this._num_states;
    }
    
    produce_mutated_child(mutation_rate) {
        return new Rule(this._mutate_instructions(mutation_rate), this._num_states);
    }
	
    produce_mutated_children(mutation_rate, num_children) {
        const children = [];
        for(let i = 0; i < num_children; i++) {
            children.push(this.produce_mutated_child(mutation_rate));
		}
        return children;
	}
    
    apply(neighbourhood):
        return this._instructions[
            get_neighbourhood_index(neighbourhood, this._num_states)
		];
}
            
                
class Tape {
    constructor(num_states, values) {
        this._num_states = num_states;
        this._values = values;
        this._spare_values = values.slice();
    
    circ_tape_update(rule) {
        for (const [x, i] of this._values.entries()) {
            this._spare_values[x] = rule.apply(
                [
                    this._values[(x - 1) % this._values.length],
                    i,
                    this._values[(x + 1) % this._values.length],
                ]
            );
		}
        for (const [x, i] of this._spare_values.entries){
            this._values[x] = i;
		}
	}
       
}	   
                
function generate_random_rule(num_states) {
    const instructions = [];
    for (let i = 0; i < num_states ** 3; i++) {
        instructions.push(Math.floor(Math.random() * (0, num_states - 1)));
	}
    return new Rule(instructions, num_states);
}
 
function generate_random_tape(num_states, num_cells) {
	const instructions = []
	
	for (let i = 0; i < num_cells; i++) {
        instructions.push(Math.floor(Math.random() * (0, num_states - 1)));
	}
	
    return new Tape(num_states, instructions);
}

function crossover_reproduce(rule1, rule2, pattern) {
    const new_instructions = [];
    for (const [x, i] of rule1.get_instructions().entries()) {
        if pattern.includes(x) {
            new_instructions.push(i);
		} else {
            new_instructions.push(rule2.get_instructions()[x]);
		}
	}
    return Rule(new_instructions, rule1.get_num_states());
}

