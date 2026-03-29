import _d from "./declarations";
// // We need this statement to make sure the decorators are included in the compiled output
const _t = _d;

interface GenerateDigitsArgs {
    /** The number of digits to generate (either 3 or 4) */
    length: number;
}

class RandomDigits {
    /** Generate numeric digits randomly for dementia screening */
    @tool
    static async generate_digits({ length }: GenerateDigitsArgs) {
        // if (length !== 3 && length !== 4) {
        //     return { success: false, error: "length must be 3 or 4" };
        // }

        // Generate random digits
        let result = "";
        for (let i = 0; i < length; i++) {
            result += Math.floor(Math.random() * 10).toString();
        }

        // Format as dash-separated string (e.g., 4-7-9-2)
        const formattedStr = result.split("").join("-");

        return { success: true, digits: result, formatted_digits: formattedStr };
    }
}
