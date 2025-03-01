const { Bixby, isPrivate } = require("../lib/");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

Bixby(
  {
    pattern: "x4mp4",
    fromMe: isPrivate,
    desc: "Reduce video’s quality by 75%.",
    type: "X-Media",
  },
  async (message, match, m) => {
    if (!message.reply_message || !message.reply_message.video)
      return await message.reply("*Need Video!*");

    await message.reply("```Editing..```");
    const buff = await m.quoted.download();

    if (!buff || buff.length === 0) {
      return await message.reply("Invalid video buffer. Please try again.");
    }

    const tempInputPath = path.join(__dirname, "temp_input.mp4");
    const outputPath = path.join(__dirname, "output.mp4");

    try {
      // Write the file
      fs.writeFileSync(tempInputPath, buff);
      console.log("Temp file saved at:", tempInputPath);

      // Verify input file
      if (!fs.existsSync(tempInputPath)) {
        console.error("Input file does not exist:", tempInputPath);
        return await message.reply("Error: Input file not found.");
      }

      const ffmpegProcess = ffmpeg(tempInputPath)
        .outputOptions("-crf 28")
        .output(outputPath)
        .on("progress", (progress) => {
          console.log(`Processing: ${progress.percent}% done`);
        })
        .on("start", (commandLine) => {
          console.log("Spawned FFmpeg with command:", commandLine);
        })
        .on("stderr", (stderrLine) => {
          console.log("FFmpeg stderr:", stderrLine);
        })
        .on("end", async () => {
          console.log("FFmpeg process completed successfully.");
          console.log("Output file path:", outputPath);

          // Check if output file exists
          if (fs.existsSync(outputPath)) {
            console.log("Output file exists. Sending...");

            // Check file readability
            fs.access(outputPath, fs.constants.R_OK, (err) => {
              if (err) {
                console.error("File is not readable:", err);
              } else {
                console.log("File is readable.");
              }
            });

            // Send as buffer (for testing)
            const outputBuffer = fs.readFileSync(outputPath);
            await message.sendMessage(
              message.jid,
              outputBuffer, // Send as buffer
              { mimetype: "video/mp4", caption: "Here's your reduced quality video!" },
              "video"
            );
          } else {
            console.error("Output file not found:", outputPath);
            await message.reply("Error: Output file not found.");
          }

          // Clean up
          fs.unlinkSync(tempInputPath);
          fs.unlinkSync(outputPath);
        })
        .on("error", (err) => {
          console.error("FFmpeg process error:", err);
          message.reply("Error processing video. Please try again.");
          if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
        })
        .run();
    } catch (err) {
      console.error("Unexpected error:", err);
      message.reply("An unexpected error occurred. Please try again.");
      if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
    }
  }
);