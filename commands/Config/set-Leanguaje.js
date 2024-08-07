const { SlashCommandBuilder } = require('@discordjs/builders');
const Guild = require('../../models/guildConfig'); // Asegúrate de importar el modelo

const supportedLanguages = {
  "en": "English",
  "es": "Español"
  // Agrega más idiomas aquí
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-language')
    .setDescription('Cambiar el idioma del bot en este servidor')
    .addStringOption(option => 
      option.setName('language')
        .setDescription('El nuevo idioma')
        .setRequired(true)
        .addChoices(
          { name: 'English', value: 'en' },
          { name: 'Español', value: 'es' }
          // Agrega más opciones de idiomas aquí
        )),
  async execute(interaction) {
    const newLanguage = interaction.options.getString('language');
    const guildId = interaction.guild.id;

    if (!Object.keys(supportedLanguages).includes(newLanguage)) {
      return interaction.reply({ content: 'Idioma no soportado.', ephemeral: true });
    }

    try {
      await Guild.findOneAndUpdate(
        { guildId },
        { language: newLanguage },
        { upsert: true, new: true }
      );

      return interaction.reply({ content: `Idioma cambiado a ${supportedLanguages[newLanguage]}`, ephemeral: true });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'Ocurrió un error al cambiar el idioma.', ephemeral: true });
    }
  },
};
