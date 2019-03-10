(function($) {
	"use scrict";

	const input = $("#input-textarea");
    const turn_ = $("#turn-textarea");
    const return_ = $("#return-textarea");
	const ranking = $("#ranking-textarea");
    let teams = [];
    let cities = {};
    let scores = {};

	/*
		Parses the input into the teams array
		as an array of [teamName, teamCity] pairs.

		Returns null in case of a parsing error.
	*/
	function parseInput(input_text) {
        teams = [];
        scores = {};
        cities = {};
        
		const rows = input_text.split("\n");

        if (rows.length < 2) {
            console.log("passed 1");
            return null;
        }
        
		for (let i = 0; i < rows.length; i++) {
			const columns = rows[i].split(";");

			if (columns.length !== 2) {
                console.log("passed 2");
                return null;
            }

            teams.push(columns[0]);

			const teamName = columns[0];

			// Can't have duplicate teams!
			if (teamName in cities) {
                console.log("passed " + i);
                return null;
            }

            cities[teamName] = columns[1];
			scores[teamName] = 0;
        }
        
        shuffle( teams );

        return true;
	}

	function permute(array) {
		const result = [];

		for (let i = 0; i < array.length - 1; i++) {
			// Home team.
			const first = array[i];

			for (let j = i + 1; j < array.length; j++) {
				// Visitor team.
				const second = array[j];

				result.push( [first,second] );
			}
		}

		return result;
    }
    
    function permute_circleMethod( array ){
        const result = []
        let N = array.length;
        let n = array.length - 1;
        let lastIsHome = false;
        
        // i is round index.
        for( let i = 0; i < N-1; i++ ){
            let round = [];

            lastIsHome = ! lastIsHome;
            if (lastIsHome) {
                round.push( [array[N-1],array[i]] );
                console.log((N-1) + " " + i);
            } else {
                round.push( [array[i],array[N-1]] );
                console.log(i + " " + (N-1));
            }

            let flag = true;
            for( let j = 0; j < N/2-1; j++ ){
                flag = ! flag;

                a = i - (j+1);
                if( a < 0 )
                    a = n + a;
                
                b = i + (j+1);
                if( b >= n )
                    b = b - n;

                if( flag === true ){
                    let c = b;
                    b = a;
                    a = c;
                }
                
                console.log(a + " " + b);

                round.push( [array[a],array[b]] );
            }
            console.log("");
            
            result.push( round );
        }

        return result;
    }

    function shuffleRoundMatches( rounds ){
        const result = [];

        for( const round of rounds ){
            shuffle( round );
            result.push( round );
        }

        return result;
    }

    // Fisher-Yates (aka Knuth) shuffle algorithm for JS arrays.
    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
      
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
      
          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
      
        return array;
      }

	function playRounds( rounds ){
		const result = [];

		for( const round of rounds ){
            let playedRound = [];

            for( const match of round ){
                playedRound.push([
                    match[0], // Home.
                    match[1], // Visitor.
                    parseInt(Math.random() * 3, 10) // Outcome.
                ]);
            }
            
            result.push( playedRound );
		}

		return result;
	}

	function formatOutput(rounds, turn) {
        const result = [];
        console.log( "len = " + rounds.length );

        for( let i = 0; i < rounds.length; i++ ){
            if( turn === 1 )
                result.push(`Rodada ${i+1}:`);
            else if( turn === 2 )
                result.push(`Rodada ${teams.length+i}:`);
            else
                result.push("ERRO");

            for (const match of rounds[i]) {
                if( turn === 1 )
                    result.push(`  ${match[0]} x ${match[1]} - ${cities[match[0]]}`);
                else if( turn === 2 )
                    result.push(`  ${match[1]} x ${match[0]} - ${cities[match[1]]}`);
                else
                    result.push("ERRO");

                switch (match[2]) {
                    case 0:
                        result.push(`     Resultado: Empate!`);
                        scores[match[0]] += 1;
                        scores[match[1]] += 1;
                        break;
                    case 1:
                        result.push(`     Resultado: ${match[0]} vence!`);
                        scores[match[0]] += 3;
                        break;
                    case 2:
                        result.push(`     Resultado: ${match[1]} vence!`);
                        scores[match[1]] += 3;
                        break;
                    default:
                        result.push("ERRO");
                }
            }

            result.push("");
        }

		return result.join("\n");
	}

	function rank(scores) {
		const result = [];
		for (const team of teams) {
			result.push(`${team}: ${scores[team]}`);
		}
		return result.join("\n");
	}
	
	$("#import-button").click(function() {
		const text = input.val();
		if (text.length === 0) {
			console.log("Input was empty!");
			return;
		}

        console.log("Parsing input...");
        parseResult = parseInput(text);
        console.log(teams);
        console.log(cities);
        console.log(scores);

		if (parseResult === null) {
			console.log("Invalid input!");
			return;
		}
		
		console.log("Permuting teams to generate matches using circle method...");
        const rounds = permute_circleMethod( teams );
        
        console.log("Shuffling matches for each round...");
        const shuffledRounds = shuffleRoundMatches( rounds );
		
		console.log("Simulating rounds...");
        const matches = playRounds( shuffledRounds );
		
		console.log("Formatting turn output...");
        turn_.val(formatOutput( matches, 1 ));
        
        console.log("Formatting return output...");
		return_.val(formatOutput( matches, 2 ));

		console.log("Ranking teams...");
		ranking.val(rank( scores ));
		
		console.log("Done!");
	});
})(jQuery);